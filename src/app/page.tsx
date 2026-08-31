"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

type MemberSummary = {
  member_id: number;
  first_name: string | null;
  last_name: string | null;
  member_type: string | null;
  expected_total: number | string | null;
  issued_total: number | string | null;
  missing_total: number | string | null;
  clothing_status: string | null;
};

type ClothingStatus = {
  member_id: number;
  article_type_id: number;
  article: string | null;
  expected_quantity: number | null;
  issued_quantity: number | string | null;
  missing_quantity: number | string | null;
};
type IndividualItem = {
  id: number;
  article_type_id: number;
  size_id: number | null;
  unique_number: string;
  status: string;
  condition: string;
};
type CurrentAssignment = {
  id: number;
  member_id: number;
  article: string | null;
  unique_number: string;
  size: string | null;
  condition: string | null;
  issued_date: string;
};
type TeamBagDifference = {
  id: number;
  bag_number: string | null;
  missing_quantity: number | null;
};

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const [memberCount, setMemberCount] = useState(0);
  const [issuedTotal, setIssuedTotal] = useState(0);
  const [missingTotal, setMissingTotal] = useState(0);
  const [teamBagsWithShortage, setTeamBagsWithShortage] = useState(0);
const [members, setMembers] = useState<MemberSummary[]>([]);
const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
const [clothingDetails, setClothingDetails] = useState<ClothingStatus[]>([]);
const [availableItems, setAvailableItems] = useState<IndividualItem[]>([]);
const [currentAssignments, setCurrentAssignments] = useState<CurrentAssignment[]>([]);
const [returnConditions, setReturnConditions] = useState<
  Record<number, "good" | "damaged">
>({});
async function loadCurrentAssignments(memberId: number) {
  const { data, error } = await supabase
    .from("current_item_assignments")
    .select(
      "id, member_id, article, unique_number, size, condition, issued_date"
    )
    .eq("member_id", memberId);

  if (error) {
    setMessage(
      "Huidige kleding kon niet worden geladen: " + error.message
    );
    return;
  }

  setCurrentAssignments((data ?? []) as CurrentAssignment[]);
}
async function loadAvailableItems(articleTypeId: number) {
  const { data, error } = await supabase
    .from("individual_items")
    .select(
      "id, article_type_id, size_id, unique_number, status, condition"
    )
    .eq("article_type_id", articleTypeId)
    .eq("status", "available");

  if (error) {
    setMessage(
      "Beschikbare kleding kon niet worden geladen: " + error.message
    );
    return;
  }

  setAvailableItems((data ?? []) as IndividualItem[]);
}
async function issueItem(
  memberId: number,
  articleTypeId: number
) {
  setMessage("");

  const { data: items, error: itemsError } = await supabase
    .from("individual_items")
    .select("id, unique_number")
    .eq("article_type_id", articleTypeId)
    .eq("status", "available")
    .limit(1);

  if (itemsError) {
    setMessage(
      "Beschikbare kleding kon niet worden geladen: " +
        itemsError.message
    );
    return;
  }

  if (!items || items.length === 0) {
    setMessage("Er is geen beschikbaar kledingstuk op voorraad.");
    return;
  }

  const item = items[0];

  const { error: assignmentError } = await supabase
    .from("item_assignments")
    .insert({
      individual_item_id: item.id,
      member_id: memberId,
      issued_date: new Date().toISOString().split("T")[0],
    });

  if (assignmentError) {
    setMessage(
      "Kledingstuk kon niet worden uitgegeven: " +
        assignmentError.message
    );
    return;
  }

  const { error: updateError } = await supabase
    .from("individual_items")
    .update({ status: "issued" })
    .eq("id", item.id);

  if (updateError) {
    setMessage(
      "Status van kledingstuk kon niet worden bijgewerkt: " +
        updateError.message
    );
    return;
  }

  setMessage(
    `Kledingstuk ${item.unique_number} is succesvol uitgegeven.`
  );

  await loadMemberDetails(memberId);
  await loadDashboard();
}

async function returnItem(assignment: CurrentAssignment) {
  const returnCondition = returnConditions[assignment.id] ?? "good";

  setMessage(
    `Retour gestart: id ${assignment.id}, kledingstuk ${assignment.unique_number}`

);
  const returnedDate = new Date().toISOString().split("T")[0];

 const { data: updatedAssignments, error: assignmentError } = await supabase
  .from("item_assignments")
 .update({
  returned_date: returnedDate,
  condition_at_return: returnCondition,
})
  .eq("id", assignment.id)
  .select("id, returned_date");

if (assignmentError) {
  setMessage(
    "Kledingstuk kon niet worden ingenomen: " +
      assignmentError.message
  );
  return;
}

if (!updatedAssignments || updatedAssignments.length === 0) {
  setMessage(
    `Geen item_assignment gevonden met id ${assignment.id}`
  );
  return;
}
const { error: itemError } = await supabase
  .from("individual_items")
  .update({
    status: returnCondition === "good" ? "available" : "damaged",
    condition: returnCondition,
  })
  .eq("unique_number", assignment.unique_number);
if (itemError) {
  setMessage(
    "Status van kledingstuk kon niet worden bijgewerkt: " +
      itemError.message
  );
  return;
}

setMessage(
  `Kledingstuk ${assignment.unique_number} is succesvol ingenomen.`
);

await loadMemberDetails(assignment.member_id);
await loadDashboard();
}

async function loadMemberDetails(memberId: number) {
  const { data, error } = await supabase
    .from("member_clothing_status")
    .select(
      "member_id, article_type_id, article, expected_quantity, issued_quantity, missing_quantity"
    )
    .eq("member_id", memberId);

  if (error) {
    setMessage(
      "Kledingdetails konden niet worden geladen: " + error.message
    );
    return;
  }

  setSelectedMemberId(memberId);
  setClothingDetails((data ?? []) as ClothingStatus[]);
await loadCurrentAssignments(memberId);
}  
async function loadDashboard() {
   const { data: memberData, error: membersError } = await supabase
  .from("member_clothing_summary")
  .select(
    "member_id, first_name, last_name, member_type, expected_total, issued_total, missing_total, clothing_status"
  );

    if (membersError) {
      setMessage(
        "Kledinggegevens konden niet worden geladen: " +
          membersError.message
      );
      return;
    }

    const memberRows = (memberData ?? []) as MemberSummary[];

setMembers(memberRows);

    setMemberCount(memberRows.length);

    setIssuedTotal(
      memberRows.reduce(
        (total, member) => total + Number(member.issued_total ?? 0),
        0
      )
    );

    setMissingTotal(
      memberRows.reduce(
        (total, member) => total + Number(member.missing_total ?? 0),
        0
      )
    );

    const { data: bags, error: bagsError } = await supabase
      .from("team_bag_stock_differences")
      .select("id, bag_number, missing_quantity")
      .gt("missing_quantity", 0);

    if (bagsError) {
      setMessage(
        "Teamtasgegevens konden niet worden geladen: " +
          bagsError.message
      );
      return;
    }

    const bagRows = (bags ?? []) as TeamBagDifference[];

    const uniqueBags = new Set(
      bagRows
        .map((bag) => bag.bag_number)
        .filter(
          (bagNumber): bagNumber is string =>
            bagNumber !== null && bagNumber !== ""
        )
    );

    setTeamBagsWithShortage(uniqueBags.size);
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("Inloggen mislukt: " + error.message);
      setLoading(false);
      return;
    }

    await loadDashboard();

    setLoggedIn(true);
    setLoading(false);
  }

  if (loggedIn) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Kledingbeheer
            </h1>

            <p className="mt-2 text-gray-600">
              Dashboard voetbalvereniging
            </p>
          </div>

          {message && (
            <div className="mb-6 rounded-lg bg-white p-4 shadow">
              <p className="text-sm text-red-700">{message}</p>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white p-6 shadow">
              <p className="text-sm text-gray-500">
                Aantal personen
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {memberCount}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow">
              <p className="text-sm text-gray-500">
                Uitgegeven kledingstukken
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {issuedTotal}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow">
              <p className="text-sm text-gray-500">
                Ontbrekende kledingstukken
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {missingTotal}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow">
              <p className="text-sm text-gray-500">
                Teamtassen met tekorten
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {teamBagsWithShortage}
              </p>
            </div>
          </div>
<div className="mt-8 overflow-hidden rounded-2xl bg-white shadow">
  <div className="border-b border-gray-200 px-6 py-4">
    <h2 className="text-xl font-bold text-gray-900">
      Personen
    </h2>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-sm font-medium text-gray-600">
            Naam
          </th>
          <th className="px-6 py-3 text-sm font-medium text-gray-600">
            Type
          </th>
          <th className="px-6 py-3 text-sm font-medium text-gray-600">
            Verwacht
          </th>
          <th className="px-6 py-3 text-sm font-medium text-gray-600">
            Uitgegeven
          </th>
          <th className="px-6 py-3 text-sm font-medium text-gray-600">
            Ontbrekend
          </th>
          <th className="px-6 py-3 text-sm font-medium text-gray-600">
            Status
          </th>
        </tr>
      </thead>

      <tbody>
        {members.map((member) => (
         <tr
  key={member.member_id}
  onClick={() => loadMemberDetails(member.member_id)}
  className="cursor-pointer border-t border-gray-100 hover:bg-gray-50"
>
            <td className="px-6 py-4 text-gray-900">
              {member.first_name} {member.last_name}
            </td>

            <td className="px-6 py-4 text-gray-600">
              {member.member_type ?? "-"}
            </td>

            <td className="px-6 py-4 text-gray-600">
              {member.expected_total ?? 0}
            </td>

            <td className="px-6 py-4 text-gray-600">
              {member.issued_total ?? 0}
            </td>

            <td className="px-6 py-4 text-gray-600">
              {member.missing_total ?? 0}
            </td>

            <td className="px-6 py-4 text-gray-600">
              {member.clothing_status ?? "-"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
{selectedMemberId !== null && (
  <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow">
    <div className="border-b border-gray-200 px-6 py-4">
     <h2 className="text-xl font-bold text-gray-900">
  Kledingdetails —{" "}
  {members.find((member) => member.member_id === selectedMemberId)
    ?.first_name}{" "}
  {members.find((member) => member.member_id === selectedMemberId)
    ?.last_name}
</h2>
    </div>

    <div className="overflow-x-auto">
{currentAssignments.length > 0 && (
  <div className="border-b border-gray-200 px-6 py-4">
    <p className="mb-2 text-sm font-medium text-gray-700">
      Momenteel in bezit:
    </p>

    <div className="space-y-1">
     {currentAssignments.map((assignment) => (
  <div
    key={assignment.id}
    className="flex items-center justify-between gap-4"
  >
    <p className="text-sm text-gray-600">
      {assignment.article ?? "-"} — nummer{" "}
      {assignment.unique_number} — maat{" "}
      {assignment.size ?? "-"}
    </p>

<div className="flex items-center gap-2">
  <select
  value={returnConditions[assignment.id] ?? "good"}
    onChange={(e) =>
  setReturnConditions((prev) => ({
    ...prev,
    [assignment.id]: e.target.value as "good" | "damaged",
  }))
}
    className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700"
  >
    <option value="good">Goed</option>
    <option value="damaged">Beschadigd</option>
  </select>

  <button
    type="button"
    onClick={() => returnItem(assignment)}
    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
  >
    Innemen
  </button>
</div>
  </div>
))}
    </div>
  </div>
)}
      <table className="w-full text-left">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-sm font-medium text-gray-600">
              Kledingstuk
            </th>
            <th className="px-6 py-3 text-sm font-medium text-gray-600">
              Recht op
            </th>
            <th className="px-6 py-3 text-sm font-medium text-gray-600">
             In bezit
            </th>
            <th className="px-6 py-3 text-sm font-medium text-gray-600">
              Nog uit te geven
            </th>
<th className="px-6 py-3 text-sm font-medium text-gray-600">
  Actie
</th>
          </tr>
        </thead>

        <tbody>
          {clothingDetails.map((item) => (
            <tr
              key={item.article_type_id}
              className="border-t border-gray-100"
            >
              <td className="px-6 py-4 text-gray-900">
                {item.article ?? "-"}
              </td>

              <td className="px-6 py-4 text-gray-600">
                {item.expected_quantity ?? 0}
              </td>

              <td className="px-6 py-4 text-gray-600">
                {item.issued_quantity ?? 0}
              </td>

              <td className="px-6 py-4 text-gray-600">
                {item.missing_quantity ?? 0}
              </td>
<td className="px-6 py-4">
  {Number(item.missing_quantity ?? 0) > 0 ? (
    <button
      type="button"
 onClick={() =>
  issueItem(selectedMemberId, item.article_type_id)
}
      className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
    >
      Uitgeven
    </button>
  ) : (
    <span className="text-sm text-gray-400">Compleet</span>
  )}
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900">
          Kledingbeheer
        </h1>

        <p className="mt-2 text-gray-600">
          Voetbalvereniging
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              E-mailadres
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-500"
              placeholder="naam@voorbeeld.nl"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Wachtwoord
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-500"
              placeholder="Je wachtwoord"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gray-900 px-4 py-3 font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? "Bezig met inloggen..." : "Inloggen"}
          </button>
        </form>

        {message && (
          <p className="mt-5 rounded-lg bg-gray-100 p-3 text-sm text-gray-800">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}