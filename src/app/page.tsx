"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

type MemberSummary = {
  member_id: number;
  first_name: string | null;
  last_name: string | null;
  member_type: string | null;
email: string | null;
phone: string | null;
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
choice_group: string | null;
};
type IndividualItem = {
  id: number;
  article_type_id: number;
  size_id: number | null;
  unique_number: string;
  status: string;
  condition: string;
};
type Size = {
  id: number;
  name: string;
};

type ArticleType = {
  id: number;
  name: string;
};
type MemberTypeEntitlement = {
  member_type_id: number;
  article_type_id: number;
  quantity: number;
sort_order: number | null;
choice_group: string | null;
};
type InventorySummary = {
  article_type_id: number;
  article: string;
  total: number;
  available: number;
  issued: number;
  damaged: number;
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
const [newMemberFirstName, setNewMemberFirstName] = useState("");
const [newMemberLastName, setNewMemberLastName] = useState("");
const [newMemberTypeId, setNewMemberTypeId] = useState<number | null>(null);
const [newMemberEmail, setNewMemberEmail] = useState("");
const [newMemberPhone, setNewMemberPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [issuedTotal, setIssuedTotal] = useState(0);
  const [missingTotal, setMissingTotal] = useState(0);
  const [teamBagsWithShortage, setTeamBagsWithShortage] = useState(0);
const [members, setMembers] = useState<MemberSummary[]>([]);
const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
const [clothingDetails, setClothingDetails] = useState<ClothingStatus[]>([]);
const [availableItems, setAvailableItems] = useState<IndividualItem[]>([]);
const [inventoryItems, setInventoryItems] = useState<IndividualItem[]>([]);
const [articleTypes, setArticleTypes] = useState<ArticleType[]>([]);
const [memberTypeEntitlements, setMemberTypeEntitlements] = useState<
  MemberTypeEntitlement[]
>([]);
const memberTypeIds: Record<string, number> = {
  Speler: 1,
  Selectiespeler: 2,
  Trainer: 3,
};
const selectedGroupEntitlements = selectedGroup
  ? memberTypeEntitlements.filter(
      (entitlement) =>
        entitlement.member_type_id === memberTypeIds[selectedGroup]
    )
  : memberTypeEntitlements;
const selectedGroupArticleTypeIds = selectedGroupEntitlements.map(
  (entitlement) => entitlement.article_type_id
);
const filteredInventoryItems = selectedGroup
  ? inventoryItems.filter((item) =>
      selectedGroupArticleTypeIds.includes(item.article_type_id)
    )
  : inventoryItems;
const filteredMembers = selectedGroup
  ? members.filter((member) => member.member_type === selectedGroup)
  : members;
const groupedClothingDetails = clothingDetails.reduce<
  Record<string, ClothingStatus[]>
>((groups, item) => {
  const key = item.choice_group ?? `article-${item.article_type_id}`;

  if (!groups[key]) {
    groups[key] = [];
  }

  groups[key].push(item);
  return groups;
}, {});
const selectedGroupIssuedTotal = filteredMembers.reduce(
  (total, member) => total + Number(member.issued_total ?? 0),
  0
);
const selectedGroupMissingTotal = filteredMembers.reduce(
  (total, member) => total + Number(member.missing_total ?? 0),
  0
);
const inventorySummary: InventorySummary[] = articleTypes
  .filter(
    (articleType) =>
      !selectedGroup ||
      selectedGroupArticleTypeIds.includes(articleType.id)
  )
  .sort((a, b) => {
    const aOrder =
      selectedGroupEntitlements.find(
        (entitlement) => entitlement.article_type_id === a.id
      )?.sort_order ?? 999;

    const bOrder =
      selectedGroupEntitlements.find(
        (entitlement) => entitlement.article_type_id === b.id
      )?.sort_order ?? 999;

    return aOrder - bOrder;
  })
  .map((articleType) => {
  const items = inventoryItems.filter(
    (item) => item.article_type_id === articleType.id
  );

  return {
    article_type_id: articleType.id,
    article: articleType.name,
    total: items.length,
    available: items.filter((item) => item.status === "available").length,
    issued: items.filter((item) => item.status === "issued").length,
    damaged: items.filter((item) => item.status === "damaged").length,
  };
});
const [currentAssignments, setCurrentAssignments] = useState<CurrentAssignment[]>([]);
const [returnConditions, setReturnConditions] = useState<
  Record<number, "good" | "damaged">
>({});
const [selectedChoiceArticles, setSelectedChoiceArticles] = useState<
  Record<string, number>
>({});
const [issueNumbers, setIssueNumbers] = useState<
  Record<string, string>
>({});
const [issueWithoutNumber, setIssueWithoutNumber] = useState<
  Record<string, boolean>
>({});
const [issueSizes, setIssueSizes] = useState<
  Record<string, number>
>({});
const [sizes, setSizes] = useState<Size[]>([]);
const [newStockArticleId, setNewStockArticleId] = useState<number | null>(null);
const [newStockSizeId, setNewStockSizeId] = useState<number | null>(null);
const [newStockNumber, setNewStockNumber] = useState("");
const [newStockWithoutNumber, setNewStockWithoutNumber] = useState(false);
const [newStockQuantity, setNewStockQuantity] = useState(1);
const [issueMessages, setIssueMessages] = useState<
  Record<string, string>
>({});
const [numberSizeLabels, setNumberSizeLabels] = useState<
  Record<string, string>
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
async function loadInventoryItems() {
  const { data, error } = await supabase
    .from("individual_items")
    .select(
      "id, article_type_id, size_id, unique_number, status, condition"
    );

  if (error) {
    setMessage(
      "Voorraad kon niet worden geladen: " + error.message
    );
    return;
  }

  setInventoryItems((data ?? []) as IndividualItem[]);
}
async function loadMemberTypeEntitlements() {
  const { data, error } = await supabase
    .from("member_type_entitlements")
    .select(
  "member_type_id, article_type_id, quantity, sort_order, choice_group"
);

  if (error) {
    setMessage(
      "Kledingrechten konden niet worden geladen: " + error.message
    );
    return;
  }

  setMemberTypeEntitlements(
    (data ?? []) as MemberTypeEntitlement[]
  );
}
async function loadArticleTypes() {
  const { data, error } = await supabase
    .from("article_types")
    .select("id, name");

  if (error) {
    setMessage(
      "Artikelsoorten konden niet worden geladen: " + error.message
    );
    return;
  }

  setArticleTypes((data ?? []) as ArticleType[]);
}
async function addMember() {
  setMessage("");

  if (
    !newMemberFirstName.trim() ||
    !newMemberLastName.trim() ||
    newMemberTypeId === null
  ) {
    setMessage("Vul voornaam, achternaam en type persoon in.");
    return;
  }

  const { error } = await supabase
    .from("members")
    .insert([
      {
        first_name: newMemberFirstName.trim(),
        last_name: newMemberLastName.trim(),
        member_type_id: newMemberTypeId,
        email: newMemberEmail.trim() || null,
        phone: newMemberPhone.trim() || null,
        active: true,
      },
    ]);

  if (error) {
    setMessage("Persoon kon niet worden toegevoegd: " + error.message);
    return;
  }

  setMessage("Persoon is succesvol toegevoegd.");

  setNewMemberFirstName("");
  setNewMemberLastName("");
  setNewMemberTypeId(null);
  setNewMemberEmail("");
  setNewMemberPhone("");

  await loadDashboard();
}
async function addStockItem() {
  setMessage("");

  if (newStockArticleId === null || newStockSizeId === null) {
    setMessage("Kies eerst een kledingstuk en een maat.");
    return;
  }
 if (!newStockWithoutNumber && !newStockNumber.trim()) {
    setMessage("Vul een nummer in of kies Geen nummer.");
    return;
  }
const stockItems = Array.from(
  { length: newStockWithoutNumber ? newStockQuantity : 1 },
  () => ({
    article_type_id: newStockArticleId,
    size_id: newStockSizeId,
    unique_number: newStockWithoutNumber
      ? null
      : newStockNumber.trim(),
    status: "available",
    condition: "good",
  })
);

const { error } = await supabase
  .from("individual_items")
  .insert(stockItems);

if (error) {
  setMessage("Voorraad kon niet worden toegevoegd: " + error.message);
  return;
}

setMessage(
  newStockWithoutNumber
    ? `${newStockQuantity} kledingstukken zijn toegevoegd aan de voorraad.`
    : `Kledingstuk ${newStockNumber.trim()} is toegevoegd aan de voorraad.`
);
setNewStockArticleId(null);
setNewStockSizeId(null);
setNewStockNumber("");
setNewStockWithoutNumber(false);
setNewStockQuantity(1);
await loadDashboard(); 
}
async function loadSizes() {
  const { data, error } = await supabase
    .from("sizes")
    .select("id, name");

  if (error) {
    setMessage("Maten konden niet worden geladen: " + error.message);
    return;
  }

  setSizes((data ?? []) as Size[]);
}
async function loadSizeForNumber(
  groupKey: string,
  articleTypeId: number,
  uniqueNumber: string
) {
  if (!uniqueNumber.trim()) {
    setNumberSizeLabels((prev) => ({
      ...prev,
      [groupKey]: "",
    }));
    return;
  }

  const { data, error } = await supabase
    .from("individual_items")
    .select("size_id")
    .eq("article_type_id", articleTypeId)
    .eq("unique_number", uniqueNumber.trim())
    .maybeSingle();

  if (error) {
    setNumberSizeLabels((prev) => ({
      ...prev,
      [groupKey]: "Maat kon niet worden opgehaald",
    }));
    return;
  }

  if (!data?.size_id) {
    setNumberSizeLabels((prev) => ({
      ...prev,
      [groupKey]: "Nummer niet gevonden in voorraad",
    }));
    return;
  }

  const size = sizes.find((entry) => entry.id === data.size_id);

  setNumberSizeLabels((prev) => ({
    ...prev,
    [groupKey]: size?.name ?? "Onbekende maat",
  }));
}
async function issueItem(
  memberId: number,
  articleTypeId: number,
  uniqueNumber: string,
  sizeId: number | null,
  groupKey: string
) {
 setMessage("");

if (!uniqueNumber.trim() && sizeId === null) {
  setIssueMessages((prev) => ({
    ...prev,
    [groupKey]: "Vul een nummer in of kies een maat.",
  }));
  return;
}

 let itemQuery = supabase
  .from("individual_items")
  .select("id, unique_number")
  .eq("article_type_id", articleTypeId)
  .eq("status", "available");

if (uniqueNumber.trim()) {
  itemQuery = itemQuery.eq("unique_number", uniqueNumber.trim());
} else if (sizeId !== null) {
  itemQuery = itemQuery.eq("size_id", sizeId);
}

const { data: items, error: itemsError } = await itemQuery.limit(1);

  if (itemsError) {
  setIssueMessages((prev) => ({
    ...prev,
    [groupKey]:
      "Beschikbare kleding kon niet worden geladen: " +
      itemsError.message,
  }));
  return;
}

 if (!items || items.length === 0) {
  setIssueMessages((prev) => ({
    ...prev,
    [groupKey]: "Er is geen passend kledingstuk op voorraad.",
  }));
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
  setIssueMessages((prev) => ({
    ...prev,
    [groupKey]:
      "Kledingstuk kon niet worden uitgegeven: " +
      assignmentError.message,
  }));
  return;
}

  const { error: updateError } = await supabase
    .from("individual_items")
    .update({ status: "issued" })
    .eq("id", item.id);

 if (updateError) {
  setIssueMessages((prev) => ({
    ...prev,
    [groupKey]:
      "Status van kledingstuk kon niet worden bijgewerkt: " +
      updateError.message,
  }));
  return;
}

setIssueMessages((prev) => ({
  ...prev,
  [groupKey]: item.unique_number
    ? `Kledingstuk ${item.unique_number} is succesvol uitgegeven.`
    : "Kledingstuk is succesvol uitgegeven.",
}));
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
  "member_id, article_type_id, article, expected_quantity, issued_quantity, missing_quantity, choice_group"
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
const { data: memberContactData, error: memberContactError } =
  await supabase
    .from("members")
    .select("id, email, phone");
    if (membersError) {
      setMessage(
        "Kledinggegevens konden niet worden geladen: " +
          membersError.message
      );
      return;
    }

    const memberRows = ((memberData ?? []) as MemberSummary[]).map((member) => {
  const contact = memberContactData?.find(
    (item) => item.id === member.member_id
  );

  return {
    ...member,
    email: contact?.email ?? null,
    phone: contact?.phone ?? null,
  };
});

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
await loadInventoryItems();
await loadArticleTypes();
await loadSizes();
await loadMemberTypeEntitlements();
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
<div className="mb-8 grid gap-4 md:grid-cols-3">
  <button
    type="button"
    onClick={() => setSelectedGroup("Trainer")}
    className="rounded-2xl bg-white p-6 text-left shadow hover:bg-gray-50"
  >
    <p className="text-lg font-bold text-gray-900">
      Trainers
    </p>
    <p className="mt-2 text-sm text-gray-600">
      Personen, uitgegeven kleding en voorraad voor trainers
    </p>
  </button>

  <button
    type="button"
    onClick={() => setSelectedGroup("Speler")}
    className="rounded-2xl bg-white p-6 text-left shadow hover:bg-gray-50"
  >
    <p className="text-lg font-bold text-gray-900">
      Spelers
    </p>
    <p className="mt-2 text-sm text-gray-600">
      Personen, uitgegeven kleding en voorraad voor spelers
    </p>
  </button>

  <button
    type="button"
    onClick={() => setSelectedGroup("Selectiespeler")}
    className="rounded-2xl bg-white p-6 text-left shadow hover:bg-gray-50"
  >
    <p className="text-lg font-bold text-gray-900">
      Selectiespelers
    </p>
    <p className="mt-2 text-sm text-gray-600">
      Personen, uitgegeven kleding en voorraad voor selectiespelers
    </p>
  </button>
</div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white p-6 shadow">
              <p className="text-sm text-gray-500">
                Aantal personen
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {selectedGroup ? filteredMembers.length : memberCount}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow">
              <p className="text-sm text-gray-500">
                Uitgegeven kledingstukken
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {selectedGroup ? selectedGroupIssuedTotal : issuedTotal}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow">
              <p className="text-sm text-gray-500">
                Ontbrekende kledingstukken
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {selectedGroup ? selectedGroupMissingTotal : missingTotal}
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
<div className="mt-8 rounded-2xl bg-white p-6 shadow">
  <h2 className="text-lg font-bold text-gray-900">
    Voorraad toevoegen
  </h2>

 <div className="mt-4 flex flex-wrap items-center gap-3">
    <select
      value={newStockArticleId ?? ""}
      onChange={(e) =>
        setNewStockArticleId(
          e.target.value ? Number(e.target.value) : null
        )
      }
      className="rounded-lg border border-gray-300 px-3 py-2"
    >
      <option value="">Kies kledingstuk</option>
      {articleTypes.map((article) => (
        <option key={article.id} value={article.id}>
          {article.name}
        </option>
      ))}
    </select>

    <select
      value={newStockSizeId ?? ""}
      onChange={(e) =>
        setNewStockSizeId(
          e.target.value ? Number(e.target.value) : null
        )
      }
      className="w-32 rounded-lg border border-gray-300 px-3 py-2"
    >
      <option value="">Kies maat</option>
      {sizes.map((size) => (
        <option key={size.id} value={size.id}>
          {size.name}
        </option>
      ))}
    </select>
<input
  type="text"
  placeholder="Nummer"
  value={newStockNumber}
  onChange={(e) => setNewStockNumber(e.target.value)}
  className="rounded-lg border border-gray-300 px-3 py-2"
/>
<label className="flex items-center gap-2 text-sm text-gray-600">
  <input
    type="checkbox"
    checked={newStockWithoutNumber}
    onChange={(e) => setNewStockWithoutNumber(e.target.checked)}
  />
  Geen nummer
</label>
{newStockWithoutNumber && (
  <input
    type="number"
    min="1"
    value={newStockQuantity}
    onChange={(e) =>
      setNewStockQuantity(
        Math.max(1, Number(e.target.value))
      )
    }
    className="w-24 rounded-lg border border-gray-300 px-3 py-2"
  />
)}
<button
  type="button"
  onClick={addStockItem}
  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
>
  Toevoegen
</button>
  </div>
</div>
<div className="mt-8 rounded-2xl bg-white p-6 shadow">
  <h2 className="text-lg font-bold text-gray-900">
    Voorraadoverzicht
  </h2>
<p className="mt-2 text-sm text-gray-600">
  Totaal kledingstukken: {filteredInventoryItems.length}
</p>
<p className="mt-1 text-sm text-gray-600">
  Beschikbaar: {filteredInventoryItems.filter((item) => item.status === "available").length}
</p>
<p className="mt-1 text-sm text-gray-600">
  Uitgegeven: {filteredInventoryItems.filter((item) => item.status === "issued").length}
</p>
<p className="mt-1 text-sm text-gray-600">
  Beschadigd: {filteredInventoryItems.filter((item) => item.status === "damaged").length}
</p>
<div className="mt-6 overflow-x-auto">
  <table className="w-full text-left">
    <thead className="border-b border-gray-200">
      <tr>
        <th className="px-3 py-2 text-sm font-medium text-gray-600">
          Kledingstuk
        </th>
        <th className="px-3 py-2 text-sm font-medium text-gray-600">
          Totaal
        </th>
        <th className="px-3 py-2 text-sm font-medium text-gray-600">
          Beschikbaar
        </th>
        <th className="px-3 py-2 text-sm font-medium text-gray-600">
          Uitgegeven
        </th>
        <th className="px-3 py-2 text-sm font-medium text-gray-600">
          Beschadigd
        </th>
      </tr>
    </thead>

    <tbody>
      {inventorySummary.map((item) => (
        <tr key={item.article_type_id} className="border-b border-gray-100">
          <td className="px-3 py-2 text-sm text-gray-700">
            {item.article}
          </td>
          <td className="px-3 py-2 text-sm text-gray-700">
            {item.total}
          </td>
          <td className="px-3 py-2 text-sm text-gray-700">
            {item.available}
          </td>
          <td className="px-3 py-2 text-sm text-gray-700">
            {item.issued}
          </td>
          <td className="px-3 py-2 text-sm text-gray-700">
            {item.damaged}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
</div>
<div className="mt-8 rounded-2xl bg-white p-6 shadow">
  <h2 className="text-lg font-bold text-gray-900">
    Persoon toevoegen
  </h2>

  <div className="mt-4 flex flex-wrap items-center gap-3">
    <input
      type="text"
      placeholder="Voornaam"
      value={newMemberFirstName}
      onChange={(e) => setNewMemberFirstName(e.target.value)}
      className="rounded-lg border border-gray-300 px-3 py-2"
    />

    <input
      type="text"
      placeholder="Achternaam"
      value={newMemberLastName}
      onChange={(e) => setNewMemberLastName(e.target.value)}
      className="rounded-lg border border-gray-300 px-3 py-2"
    />

    <select
      value={newMemberTypeId ?? ""}
      onChange={(e) =>
        setNewMemberTypeId(
          e.target.value ? Number(e.target.value) : null
        )
      }
      className="rounded-lg border border-gray-300 px-3 py-2"
    >
      <option value="">Kies type</option>
      <option value="1">Speler</option>
      <option value="2">Selectiespeler</option>
      <option value="3">Trainer</option>
    </select>

    <input
      type="email"
      placeholder="E-mailadres"
      value={newMemberEmail}
      onChange={(e) => setNewMemberEmail(e.target.value)}
      className="rounded-lg border border-gray-300 px-3 py-2"
    />

    <input
      type="tel"
      placeholder="Telefoonnummer"
      value={newMemberPhone}
      onChange={(e) => setNewMemberPhone(e.target.value)}
      className="rounded-lg border border-gray-300 px-3 py-2"
    />

    <button
      type="button"
      onClick={addMember}
      className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
    >
      Toevoegen
    </button>
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
  E-mail
</th>
<th className="px-6 py-3 text-sm font-medium text-gray-600">
  Telefoon
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
       {filteredMembers.map((member) => (
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
  {member.email ?? "-"}
</td>

<td className="px-6 py-4 text-gray-600">
  {member.phone ?? "-"}
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
          {Object.entries(groupedClothingDetails).map(([groupKey, items]) => {
  const item = items[0];
const groupExpected = Math.max(
  ...items.map((groupItem) => Number(groupItem.expected_quantity ?? 0))
);

const groupIssued = items.reduce(
  (total, groupItem) =>
    total + Number(groupItem.issued_quantity ?? 0),
  0
);

const groupMissing = Math.max(groupExpected - groupIssued, 0);
  return (
            <tr
              key={item.article_type_id}
              className="border-t border-gray-100"
            >
              <td className="px-6 py-4 text-gray-900">
                {item.choice_group === "tas" ? "Tas" : item.article ?? "-"}
              </td>

              <td className="px-6 py-4 text-gray-600">
                {groupExpected}
              </td>

              <td className="px-6 py-4 text-gray-600">
                {groupIssued}
              </td>

              <td className="px-6 py-4 text-gray-600">
                {groupMissing}
              </td>
<td className="px-6 py-4">
{groupMissing > 0 ? (
  <>
{item.choice_group === "tas" && (
  <select
    value={selectedChoiceArticles[groupKey] ?? items[0].article_type_id}
    onChange={(e) =>
      setSelectedChoiceArticles((prev) => ({
        ...prev,
        [groupKey]: Number(e.target.value),
      }))
    }
    className="mb-2 block rounded-lg border border-gray-300 px-2 py-2 text-sm"
  >
    {items.map((choice) => (
      <option key={choice.article_type_id} value={choice.article_type_id}>
        {choice.article}
      </option>
    ))}
  </select>
)}
<input
  type="text"
  placeholder="Nummer"
  value={issueNumbers[groupKey] ?? ""}
 onChange={(e) => {
  const value = e.target.value;

  setIssueNumbers((prev) => ({
    ...prev,
    [groupKey]: value,
  }));

  loadSizeForNumber(
    groupKey,
    item.choice_group === "tas"
      ? selectedChoiceArticles[groupKey] ?? items[0].article_type_id
      : item.article_type_id,
    value
  );
}}
  className="mb-2 block w-28 rounded-lg border border-gray-300 px-2 py-2 text-sm"
/>
<label className="mb-2 flex items-center gap-2 text-sm text-gray-600">
  <input
    type="checkbox"
    checked={issueWithoutNumber[groupKey] ?? false}
    onChange={(e) =>
      setIssueWithoutNumber((prev) => ({
        ...prev,
        [groupKey]: e.target.checked,
      }))
    }
  />
  Geen nummer
</label>
{issueWithoutNumber[groupKey] && (
  <select
    value={issueSizes[groupKey] ?? ""}
    onChange={(e) =>
      setIssueSizes((prev) => ({
        ...prev,
        [groupKey]: Number(e.target.value),
      }))
    }
    className="mb-2 block rounded-lg border border-gray-300 px-2 py-2 text-sm"
  >
    <option value="">Kies maat</option>
    {sizes.map((size) => (
      <option key={size.id} value={size.id}>
        {size.name}
      </option>
    ))}
  </select>
)}
    <button
   type="button"
  onClick={() =>
    issueItem(
      selectedMemberId,
      item.choice_group === "tas"
        ? selectedChoiceArticles[groupKey] ?? items[0].article_type_id
        : item.article_type_id,
      issueNumbers[groupKey] ?? "",
      issueWithoutNumber[groupKey]
        ? issueSizes[groupKey] ?? null
        : null,
      groupKey
    )
  }
      className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
    >
      Uitgeven
</button>
{issueMessages[groupKey] && (
  <div className="mt-2 text-sm text-red-600">
    {issueMessages[groupKey]}
  </div>
)}
  </>
) : (
    <span className="text-sm text-gray-400">Compleet</span>
  )}
</td>
            </tr>
         );
})}
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