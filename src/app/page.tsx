"use client";

import { FormEvent, useEffect, useState } from "react";
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
type FoundItem = {
  id: number;
  individual_item_id: number;
  member_id: number | null;
  part: string | null;
  found_date: string;
  found_location: string | null;
  note: string | null;
  status: string;
  returned_at: string | null;
  notification_sent_at: string | null;
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
type TeamBag = {
  id: number;
  bag_number: string;
  name: string;
  team_id: number;
  season_id: number;
  status: string;
holder_name: string | null;
holder_last_name: string | null;
holder_mail: string | null;
holder_phone: string | null;
issued_at: string | null;
returned_at: string | null;
};
type TeamBagContent = {
  id: number;
  team_bag_id: number;
  article_type_id: number;
  size_id: number | null;
  expected_quantity: number;
  actual_quantity: number;
  damaged_quantity: number;

};
export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
const [resetMode, setResetMode] = useState(false);
const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
const [returnMessages, setReturnMessages] = useState<Record<number, string>>({});
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
const [teamBags, setTeamBags] = useState<TeamBag[]>([]);
const [teamBagContentMessage, setTeamBagContentMessage] = useState("");
const [selectedTeamBagId, setSelectedTeamBagId] = useState<number | null>(null);
const [teamBagHolderName, setTeamBagHolderName] = useState("");
const [teamBagHolderLastName, setTeamBagHolderLastName] = useState("");
const [teamBagHolderMail, setTeamBagHolderMail] = useState("");
const [teamBagHolderPhone, setTeamBagHolderPhone] = useState("");
const [teamBagIssueMessage, setTeamBagIssueMessage] = useState("");
const [teamBagReturnMessage, setTeamBagReturnMessage] = useState("");
const [teamBagReturnActual, setTeamBagReturnActual] = useState<Record<number, number>>({});
const [teamBagReturnDamaged, setTeamBagReturnDamaged] = useState<Record<number, number>>({});
const [teamBagContents, setTeamBagContents] = useState<TeamBagContent[]>([]);
const [newBagArticleId, setNewBagArticleId] = useState<number | null>(5);
const [newBagSizeId, setNewBagSizeId] = useState<number | null>(null);
const [newBagQuantity, setNewBagQuantity] = useState(1);
const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
const [activeSection, setActiveSection] = useState<string>("overzicht");
const [itemSearchNumber, setItemSearchNumber] = useState("");
const [itemSearchArticleId, setItemSearchArticleId] = useState<number | null>(null);
const [itemSearchResult, setItemSearchResult] = useState<string>("");
const [foundItemId, setFoundItemId] = useState<number | null>(null);
const [foundItemMemberId, setFoundItemMemberId] = useState<number | null>(null);
const [foundItemPart, setFoundItemPart] = useState("");
const [foundItemArticleName, setFoundItemArticleName] = useState("");
const [foundItemLocation, setFoundItemLocation] = useState("");
const [foundItemNote, setFoundItemNote] = useState("");
const [foundItemMessage, setFoundItemMessage] = useState("");
const [foundItemMessageType, setFoundItemMessageType] =
  useState<"success" | "error">("success");
const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
const [showFoundItemForm, setShowFoundItemForm] = useState(false);
const [memberSearch, setMemberSearch] = useState("");
const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
const [clothingDetails, setClothingDetails] = useState<ClothingStatus[]>([]);
const [availableItems, setAvailableItems] = useState<IndividualItem[]>([]);
const [inventoryItems, setInventoryItems] = useState<IndividualItem[]>([]);
const [articleTypes, setArticleTypes] = useState<ArticleType[]>([]);
const [stockMessage, setStockMessage] = useState("");
const [memberTypeEntitlements, setMemberTypeEntitlements] = useState<
  MemberTypeEntitlement[]
>([]);
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      setLoggedIn(true);
      loadDashboard();
    }
  });

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") {
      setResetMode(true);
      setMessage("");
    }
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);
const memberTypeIds: Record<string, number> = {
  Speler: 1,
  Selectiespeler: 2,
  Trainer: 3,
};
const selectedGroupEntitlements = (
  selectedGroup
    ? memberTypeEntitlements.filter(
        (entitlement) =>
          entitlement.member_type_id === memberTypeIds[selectedGroup]
      )
    : memberTypeEntitlements
).sort(
  (a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999)
);
const selectedGroupArticleTypeIds = selectedGroupEntitlements.map(
  (entitlement) => entitlement.article_type_id
);
const filteredInventoryItems = selectedGroup
  ? inventoryItems.filter((item) =>
      selectedGroupArticleTypeIds.includes(item.article_type_id)
    )
  : inventoryItems;
const filteredMembers = members.filter((member) => {
  const matchesGroup =
    selectedGroup === null || member.member_type === selectedGroup;

  const fullName = `${member.first_name ?? ""} ${member.last_name ?? ""}`
    .toLowerCase()
    .trim();

  const matchesSearch =
    memberSearch.trim() === "" ||
    fullName.includes(memberSearch.toLowerCase().trim());

  return matchesGroup && matchesSearch;
});
const selectedMemberFoundItems =
  selectedMemberId !== null
    ? foundItems.filter(
        (foundItem) => foundItem.member_id === selectedMemberId
      )
    : [];
const groupedClothingDetails = [...clothingDetails]
  .sort((a, b) => {
    const aOrder =
      selectedGroupEntitlements.find(
        (entitlement) =>
          entitlement.article_type_id === a.article_type_id
      )?.sort_order ?? 999;

    const bOrder =
      selectedGroupEntitlements.find(
        (entitlement) =>
          entitlement.article_type_id === b.article_type_id
      )?.sort_order ?? 999;

    return aOrder - bOrder;
  })
  .reduce<Record<string, ClothingStatus[]>>((groups, item) => {
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
async function issueTeamBag() {
 setTeamBagIssueMessage("");
  if (selectedTeamBagId === null) {
    setMessage("Kies eerst een teamtas.");
    return;
  }

 if (
  !teamBagHolderName.trim() ||
  !teamBagHolderLastName.trim()
) {
  setTeamBagIssueMessage(
    "Vul de voornaam en achternaam in van degene die de tas heeft opgehaald."
  );
  return;
}
  const { error } = await supabase
    .from("team_bags")
    .update({
      holder_name: teamBagHolderName.trim(),
holder_last_name: teamBagHolderLastName.trim() || null,
      holder_mail: teamBagHolderMail.trim() || null,
      holder_phone: teamBagHolderPhone.trim() || null,
      issued_at: new Date().toISOString(),
      returned_at: null,
      status: "issued",
    })
    .eq("id", selectedTeamBagId);

  if (error) {
    setMessage(
      "Teamtas kon niet worden uitgegeven: " + error.message
    );
    return;
  }

  setTeamBagIssueMessage("Teamtas is succesvol uitgegeven.");
  setTeamBagHolderName("");
setTeamBagHolderLastName("");
  setTeamBagHolderMail("");
  setTeamBagHolderPhone("");

  await loadDashboard();
}
async function addTeamBagContent() {
  if (selectedTeamBagId === null) {
  setTeamBagContentMessage("Geen teamtas geselecteerd.");
  return;
}

if (newBagArticleId === null) {
  setTeamBagContentMessage("Geen kledingstuk geselecteerd.");
  return;
}

if (newBagSizeId === null) {
  setTeamBagContentMessage("Geen maat geselecteerd.");
  return;
}

  const { error } = await supabase
    .from("team_bag_contents")
    .insert({
      team_bag_id: selectedTeamBagId,
      article_type_id: newBagArticleId,
      size_id: newBagSizeId,
      expected_quantity: newBagQuantity,
      actual_quantity: newBagQuantity,
      damaged_quantity: 0,
    });

  if (error) {
    setTeamBagContentMessage(
      "Kledingstuk kon niet aan de teamtas worden toegevoegd: " +
        error.message
    );
    return;
  }

  setNewBagArticleId(5);
  setNewBagSizeId(null);
  setNewBagQuantity(1);

  await loadDashboard();

  setTeamBagContentMessage(
    "Kledingstuk is succesvol aan de teamtas toegevoegd."
  );
}
async function removeTeamBagContent() {
  if (selectedTeamBagId === null) {
    setTeamBagContentMessage("Geen teamtas geselecteerd.");
    return;
  }

  if (newBagArticleId === null) {
    setTeamBagContentMessage("Geen kledingstuk geselecteerd.");
    return;
  }

  if (newBagSizeId === null) {
    setTeamBagContentMessage("Geen maat geselecteerd.");
    return;
  }

  const matchingItem = teamBagContents.find(
    (item) =>
      item.team_bag_id === selectedTeamBagId &&
      item.article_type_id === newBagArticleId &&
      item.size_id === newBagSizeId
  );

  if (!matchingItem) {
    setTeamBagContentMessage(
      "Dit kledingstuk met deze maat staat niet in de teamtas."
    );
    return;
  }

  if (newBagQuantity > matchingItem.expected_quantity) {
    setTeamBagContentMessage(
      "Je kunt niet meer innemen dan er in de teamtas zit."
    );
    return;
  }

  const newExpectedQuantity =
    matchingItem.expected_quantity - newBagQuantity;

  const newActualQuantity = Math.max(
    0,
    matchingItem.actual_quantity - newBagQuantity
  );

  if (newExpectedQuantity === 0) {
    const { error } = await supabase
      .from("team_bag_contents")
      .delete()
      .eq("id", matchingItem.id);

    if (error) {
      setTeamBagContentMessage(
        "Kledingstuk kon niet uit de teamtas worden verwijderd: " +
          error.message
      );
      return;
    }
  } else {
    const { error } = await supabase
      .from("team_bag_contents")
      .update({
        expected_quantity: newExpectedQuantity,
        actual_quantity: newActualQuantity,
      })
      .eq("id", matchingItem.id);

    if (error) {
      setTeamBagContentMessage(
        "Kledingstuk kon niet worden ingenomen: " + error.message
      );
      return;
    }
  }

  setNewBagArticleId(5);
  setNewBagSizeId(null);
  setNewBagQuantity(1);

  await loadDashboard();

  setTeamBagContentMessage(
    "Kledingstuk is succesvol uit de teamtas ingenomen."
  );
}
async function returnTeamBag() {
  setTeamBagReturnMessage("");

  if (selectedTeamBagId === null) {
    setTeamBagReturnMessage("Kies eerst een teamtas.");
    return;
  }

  const contents = teamBagContents.filter(
    (item) => item.team_bag_id === selectedTeamBagId
  );

  for (const item of contents) {
    const actualQuantity =
      teamBagReturnActual[item.id] ?? item.actual_quantity;

    const damagedQuantity =
      teamBagReturnDamaged[item.id] ?? item.damaged_quantity;

    if (
      actualQuantity < 0 ||
      damagedQuantity < 0 ||
      damagedQuantity > actualQuantity
    ) {
      setTeamBagReturnMessage(
        "Controleer de aantallen. Beschadigd kan niet hoger zijn dan aanwezig."
      );
      return;
    }

    const { error } = await supabase
      .from("team_bag_contents")
      .update({
        actual_quantity: actualQuantity,
        damaged_quantity: damagedQuantity,
      })
      .eq("id", item.id);

    if (error) {
      setTeamBagReturnMessage(
        "Inhoud van de teamtas kon niet worden opgeslagen: " +
          error.message
      );
      return;
    }
  }
const selectedBag = teamBags.find(
  (bag) => bag.id === selectedTeamBagId
);

if (!selectedBag) {
  setTeamBagReturnMessage("Teamtas kon niet worden gevonden.");
  return;
}

const returnedAt = new Date().toISOString();

const { error: historyError } = await supabase
  .from("team_bag_history")
  .insert({
    team_bag_id: selectedBag.id,
    holder_name: selectedBag.holder_name,
    holder_last_name: selectedBag.holder_last_name,
    holder_mail: selectedBag.holder_mail,
    holder_phone: selectedBag.holder_phone,
    issued_at: selectedBag.issued_at,
    returned_at: returnedAt,
    status: "returned",
    notes: null,
  });

if (historyError) {
  setTeamBagReturnMessage(
    "Historie kon niet worden opgeslagen: " +
      historyError.message
  );
  return;
}
  const { error: bagError } = await supabase
    .from("team_bags")
    .update({
      status: "returned",
   returned_at: returnedAt,
    })
    .eq("id", selectedTeamBagId);

  if (bagError) {
    setTeamBagReturnMessage(
      "Teamtas kon niet worden ingenomen: " + bagError.message
    );
    return;
  }

  setTeamBagReturnMessage("Teamtas is succesvol ingenomen.");

  await loadDashboard();
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
async function searchItem() {
  const searchNumber = itemSearchNumber.trim();

  if (!searchNumber) {
    setItemSearchResult("Vul eerst een itemnummer in.");
    return;
  }

  setItemSearchResult("");
setFoundItemMessage("");
setFoundItemId(null);
setFoundItemMemberId(null);
setFoundItemPart("");

  let query = supabase
  .from("individual_items")
  .select("id, article_type_id, size_id, unique_number, status, condition")
  .eq("unique_number", searchNumber);

if (itemSearchArticleId !== null) {
  query = query.eq("article_type_id", itemSearchArticleId);
}

const { data: items, error: itemError } = await query;

  if (itemError) {
    setItemSearchResult("Item kon niet worden opgezocht.");
    return;
  }

  if (!items || items.length === 0) {
  setItemSearchResult("Geen kledingstuk gevonden met dit nummer.");
  return;
}
const { data: assignments, error: assignmentError } = await supabase
  .from("current_item_assignments")
  .select("member_id, first_name, last_name, article, unique_number, size")
  .eq("unique_number", searchNumber);

if (assignmentError) {
  setItemSearchResult("Uitgiftegegevens konden niet worden opgezocht.");
  return;
}
if (items.length === 1) {
  const foundItem = items[0];

  const foundArticle = articleTypes.find(
    (article) => article.id === foundItem.article_type_id
  );
setFoundItemArticleName(foundArticle?.name ?? "");

  const foundAssignment = assignments?.find(
    (assignment) =>
      assignment.unique_number === searchNumber &&
      assignment.article === foundArticle?.name
  );

  setFoundItemId(foundItem.id);
  setFoundItemMemberId(foundAssignment?.member_id ?? null);
}

const results = items.map((item) => {
  const article = articleTypes.find(
    (article) => article.id === item.article_type_id
  );

  const size = sizes.find(
    (size) => size.id === item.size_id
  );

 const assignment = assignments?.find(
  (assignment) =>
    assignment.unique_number === searchNumber &&
    assignment.article === article?.name
);

  if (assignment) {
    const member = members.find(
      (member) => member.member_id === assignment.member_id
    );

    const memberName = member
      ? `${member.first_name ?? ""} ${member.last_name ?? ""}`.trim()
      : "Onbekende persoon";

    return `${article?.name ?? "Onbekend kledingstuk"} | Maat: ${
      size?.name ?? "-"
    } | Uitgegeven aan: ${memberName}`;
  }

  return `${article?.name ?? "Onbekend kledingstuk"} | Maat: ${
    size?.name ?? "-"
  } | Niet uitgegeven`;
});

setItemSearchResult(results.join("\n"));
}
async function registerFoundItem() {
  if (foundItemId === null) {
    setFoundItemMessage("Er is geen kledingstuk geselecteerd.");
    return;
  }

  if (
    foundItemArticleName === "Presentatiepak" &&
    !foundItemPart
  ) {
    setFoundItemMessage("Kies eerst Jack of Broek.");
    return;
  }

  setFoundItemMessage("");
const { data: existingFoundItems, error: existingFoundItemError } =
  await supabase
    .from("found_items")
    .select("id")
    .eq("individual_item_id", foundItemId)
    .eq("status", "gevonden");

if (existingFoundItemError) {
  setFoundItemMessage(
    "Controle op bestaande registratie mislukt: " +
      existingFoundItemError.message
  );
  return;
}

if ((existingFoundItems ?? []).length > 0) {
setFoundItemMessageType("error");
  setFoundItemMessage(
    "Dit kledingstuk staat al als gevonden geregistreerd."
  );
  return;
}
  const { error } = await supabase
    .from("found_items")
    .insert({
      individual_item_id: foundItemId,
      member_id: foundItemMemberId,
      part: foundItemPart || null,
      note: foundItemNote.trim() || null,
    });

  if (error) {
    setFoundItemMessage(
      "Gevonden voorwerp kon niet worden geregistreerd: " + error.message
    );
    return;
  }
setFoundItemMessageType("success");
  setFoundItemMessage("Gevonden voorwerp is geregistreerd.");
  setFoundItemNote("");
  setFoundItemPart("");
  setShowFoundItemForm(false);
}
async function markFoundItemReturned(foundItemId: number) {
  const { error } = await supabase
    .from("found_items")
    .update({
      status: "teruggegeven",
      returned_at: new Date().toISOString(),
    })
    .eq("id", foundItemId);

  if (error) {
    setMessage(
      "Gevonden voorwerp kon niet als teruggegeven worden gemarkeerd: " +
        error.message
    );
    return;
  }

  await loadDashboard();
}
async function addStockItem() {
  setMessage("");

if (
  newStockArticleId === null ||
  (newStockSizeId === null && ![12, 13].includes(newStockArticleId))
) {
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

setStockMessage(
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

setReturnMessages({
  [assignment.id]: `Kledingstuk ${assignment.unique_number} is succesvol ingenomen.`,
});
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
setMessage("");
setReturnMessages({});
  setSelectedMemberId(memberId);
const selectedMember = members.find(
  (member) => member.member_id === memberId
);

const selectedMemberTypeId =
  selectedMember?.member_type
    ? memberTypeIds[selectedMember.member_type]
    : undefined;

const sortedClothingDetails = ((data ?? []) as ClothingStatus[]).sort(
  (a, b) => {
    const aOrder =
      memberTypeEntitlements.find(
        (entitlement) =>
          entitlement.member_type_id === selectedMemberTypeId &&
          entitlement.article_type_id === a.article_type_id
      )?.sort_order ?? 999;

    const bOrder =
      memberTypeEntitlements.find(
        (entitlement) =>
          entitlement.member_type_id === selectedMemberTypeId &&
          entitlement.article_type_id === b.article_type_id
      )?.sort_order ?? 999;

    return aOrder - bOrder;
  }
);

setClothingDetails(sortedClothingDetails);
await loadCurrentAssignments(memberId);
}  
async function loadDashboard() {
   const { data: memberData, error: membersError } = await supabase
  .from("member_clothing_summary")
  .select(
    "member_id, first_name, last_name, member_type, expected_total, issued_total, missing_total, clothing_status"
    )

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
const { data: teamBagData, error: teamBagError } = await supabase
  .from("team_bags")
.select(
  "id, bag_number, name, team_id, season_id, status, holder_name, holder_last_name, holder_mail, holder_phone, issued_at, returned_at"
)
.order("bag_number", { ascending: true });
if (teamBagError) {
  setMessage(
    "Teamtassen konden niet worden geladen: " + teamBagError.message
  );
  return;
}

setTeamBags((teamBagData ?? []) as TeamBag[]);
const { data: teamBagContentData, error: teamBagContentError } =
  await supabase
    .from("team_bag_contents")
    .select(
      "id, team_bag_id, article_type_id, size_id, expected_quantity, actual_quantity, damaged_quantity"
    );

if (teamBagContentError) {
  setMessage(
    "Inhoud van teamtassen kon niet worden geladen: " +
      teamBagContentError.message
  );
  return;
}

setTeamBagContents(
  (teamBagContentData ?? []) as TeamBagContent[]
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
const { data: foundItemData, error: foundItemError } = await supabase
  .from("found_items")
  .select(
    "id, individual_item_id, member_id, part, found_date, found_location, note, status, returned_at, notification_sent_at"
  )
  .eq("status", "gevonden")
  .order("found_date", { ascending: false });

if (foundItemError) {
  setMessage(
    "Gevonden voorwerpen konden niet worden geladen: " +
      foundItemError.message
  );
  return;
}

setFoundItems((foundItemData ?? []) as FoundItem[]);
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
async function handleLogout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    setMessage("Uitloggen mislukt: " + error.message);
    return;
  }

  setLoggedIn(false);
  setMessage("");
}
async function handleForgotPassword() {
  if (!email.trim()) {
    setMessage("Vul eerst je e-mailadres in.");
    return;
  }

  setMessage("");

  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim(),
    {
      redirectTo: window.location.origin,
    }
  );

  if (error) {
    setMessage("Resetlink kon niet worden verstuurd: " + error.message);
    return;
  }

  setMessage(
    "Er is een e-mail verstuurd waarmee je een nieuw wachtwoord kunt instellen."
  );
}
async function handleUpdatePassword() {
  if (newPassword.length < 6) {
    setMessage("Het nieuwe wachtwoord moet minimaal 6 tekens bevatten.");
    return;
  }

  setMessage("");

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    setMessage("Wachtwoord kon niet worden gewijzigd: " + error.message);
    return;
  }

  setNewPassword("");
  setResetMode(false);
  setMessage("Je wachtwoord is gewijzigd. Je kunt nu inloggen.");
}
if (resetMode) {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900">
          Nieuw wachtwoord
        </h1>

        <p className="mt-2 text-gray-600">
          Kies een nieuw wachtwoord voor je account.
        </p>

        <div className="mt-8">
          <label
            htmlFor="new-password"
            className="block text-sm font-medium text-gray-700"
          >
            Nieuw wachtwoord
          </label>

          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-500"
            placeholder="Je nieuwe wachtwoord"
          />
        </div>

        <button
          type="button"
          onClick={handleUpdatePassword}
          className="mt-5 w-full rounded-lg bg-gray-900 px-4 py-3 font-medium text-white hover:bg-gray-700"
        >
          Wachtwoord opslaan
        </button>

        {message && (
          <p className="mt-5 rounded-lg bg-gray-100 p-3 text-sm text-gray-800">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
  if (loggedIn) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-6xl">
         <div className="mb-8">
  <div className="flex items-start justify-between">
  <div className="flex items-center gap-4">
  <img
    src="/sc-leovardia-logo.jpg"
    alt="sc Leovardia"
    className="h-16 w-16 rounded-full object-cover"
  />

  <div>
    <h1 className="text-3xl font-bold text-gray-900">
      Kledingbeheer
    </h1>

    <p className="mt-1 text-gray-600">
      sc Leovardia
    </p>
  </div>
</div>

 <div className="flex items-center gap-3">
 

  <button
    type="button"
    onClick={handleLogout}
   className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
  >
    Uitloggen
  </button>
</div>
  </div>
<div className="mt-4 flex flex-wrap gap-2">
  <button
    type="button"
    onClick={() => setActiveSection("overzicht")}
    className={`rounded-lg px-4 py-2 text-sm font-medium ${
      activeSection === "overzicht"
        ? "bg-gray-900 text-white"
        : "bg-white text-gray-700 border border-gray-300"
    }`}
  >
    Overzicht
  </button>

  <button
    type="button"
  onClick={() => {
  setSelectedGroup(null);
  setActiveSection("personen");
}}
    className={`rounded-lg px-4 py-2 text-sm font-medium ${
      activeSection === "personen"
        ? "bg-gray-900 text-white"
        : "bg-white text-gray-700 border border-gray-300"
    }`}
  >
    Personen & kleding
  </button>

  <button
    type="button"
    onClick={() => setActiveSection("voorraad")}
    className={`rounded-lg px-4 py-2 text-sm font-medium ${
      activeSection === "voorraad"
        ? "bg-gray-900 text-white"
        : "bg-white text-gray-700 border border-gray-300"
    }`}
  >
    Voorraad
  </button>

  <button
    type="button"
    onClick={() => setActiveSection("teamtassen")}
    className={`rounded-lg px-4 py-2 text-sm font-medium ${
      activeSection === "teamtassen"
        ? "bg-gray-900 text-white"
        : "bg-white text-gray-700 border border-gray-300"
    }`}
  >
    Teamtassen
  </button>
</div>
          </div>

          {message && message !== "Persoon is succesvol toegevoegd." && (
            <div className="mb-6 rounded-lg bg-white p-4 shadow">
           <p
  className={`text-sm ${
    message.toLowerCase().includes("succesvol")
      ? "text-green-700"
      : "text-red-700"
  }`}
>
  {message}
</p>
            </div>
          )}
<div className="mb-8 grid gap-4 md:grid-cols-3">
  <button
    type="button"
   onClick={() => {
  setSelectedGroup("Trainer");
  setActiveSection("personen");
}}
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
  onClick={() => {
  setSelectedGroup("Speler");
  setActiveSection("personen");
}}
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
    onClick={() => {
  setSelectedGroup("Selectiespeler");
  setActiveSection("personen");
}}
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
{activeSection === "overzicht" && (
  <div className="mt-8 rounded-2xl bg-white p-6 shadow">
    <h2 className="text-lg font-bold text-gray-900">
      Item zoeken
    </h2>

    <p className="mt-2 text-sm text-gray-600">
      Zoek op het nummer van een gevonden kledingstuk.
    </p>

    <div className="mt-4 flex flex-wrap items-center gap-3">
<select
  value={itemSearchArticleId ?? ""}
  onChange={(e) =>
    setItemSearchArticleId(
      e.target.value ? Number(e.target.value) : null
    )
  }
  className="rounded-lg border border-gray-300 px-3 py-2"
>
  <option value="">Alle artikelen</option>
  {articleTypes.map((article) => (
    <option key={article.id} value={article.id}>
      {article.name}
    </option>
  ))}
</select>   
   <input
        type="text"
        placeholder="Itemnummer"
        value={itemSearchNumber}
        onChange={(e) => setItemSearchNumber(e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2"
      />

      <button
        type="button"
        onClick={searchItem}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
      >
        Zoeken
      </button>
    </div>
{itemSearchResult && (
  <div className="mt-4 whitespace-pre-line rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
    {itemSearchResult}
  </div>
)}
{foundItemId !== null && (
  <button
    type="button"
onClick={() => setShowFoundItemForm(true)}
    className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
  >
    Als gevonden registreren
  </button>
)}
 {foundItemMessage && (
  <div
    className={`mt-4 rounded-lg p-3 text-sm font-medium ${
      foundItemMessageType === "error"
        ? "bg-red-50 text-red-700"
        : "bg-green-50 text-green-700"
    }`}
  >
    {foundItemMessage}
  </div>
)}
{showFoundItemForm && foundItemId !== null && (
  <div className="mt-4 rounded-lg border border-gray-200 p-4">
    <h3 className="font-semibold">Gevonden voorwerp registreren</h3>
{foundItemArticleName === "Presentatiepak" && (
  <div className="mt-3">
    <label className="mb-1 block text-sm font-medium">
      Onderdeel
    </label>
    <select
      value={foundItemPart}
      onChange={(e) => setFoundItemPart(e.target.value)}
      className="w-full rounded-lg border border-gray-300 px-3 py-2"
    >
      <option value="">Kies onderdeel</option>
      <option value="Jack">Jack</option>
      <option value="Broek">Broek</option>
    </select>
  </div>
)}
 
    <div className="mt-3">
      <label className="mb-1 block text-sm font-medium">
        Notitie
      </label>
      <textarea
        value={foundItemNote}
        onChange={(e) => setFoundItemNote(e.target.value)}
        placeholder="Eventuele bijzonderheden"
        className="w-full rounded-lg border border-gray-300 px-3 py-2"
      />
    </div>
<button
  type="button"
onClick={registerFoundItem}
  className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
>
  Registreren
</button>
  </div>
)}
  </div>
)}
{activeSection === "voorraad" && (
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
{![12, 13].includes(newStockArticleId ?? 0) && (
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
)}
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
{stockMessage && (
  <p className="mt-2 text-sm text-green-600">
    {stockMessage}
  </p>
)}
  </div>
</div>
)}
{activeSection === "voorraad" && (
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
)}
{activeSection === "teamtassen" && (
<div className="mt-8 overflow-hidden rounded-2xl bg-white shadow">
  <div className="border-b border-gray-200 px-6 py-4">
    <h2 className="text-xl font-bold text-gray-900">
      Teamtassen
    </h2>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-sm font-medium text-gray-600">
            Tasnummer
          </th>
          <th className="px-6 py-3 text-sm font-medium text-gray-600">
            Naam
          </th>
          <th className="px-6 py-3 text-sm font-medium text-gray-600">
            Status
          </th>
        </tr>
      </thead>

      <tbody>
        {teamBags.map((bag) => (
      <tr
  key={bag.id}
  onClick={() => {
  setSelectedTeamBagId(bag.id);

  const contents = teamBagContents.filter(
    (item) => item.team_bag_id === bag.id
  );

  setTeamBagReturnActual(
    Object.fromEntries(
      contents.map((item) => [item.id, item.actual_quantity])
    )
  );

  setTeamBagReturnDamaged(
    Object.fromEntries(
      contents.map((item) => [item.id, item.damaged_quantity])
    )
  );

  setTeamBagReturnMessage("");
}}
  className="cursor-pointer border-b border-gray-100 hover:bg-gray-50"
>
            <td className="px-6 py-4 text-gray-900">
              {bag.bag_number}
            </td>

            <td className="px-6 py-4 text-gray-600">
              {bag.name}
            </td>

            <td className="px-6 py-4 text-gray-600">
              {bag.status === "issued"
  ? "Uitgegeven"
  : bag.status === "returned"
  ? "Ingenomen"
  : bag.status}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
{selectedTeamBagId !== null && (
  <div className="border-t border-gray-200 px-6 py-4">
   <h3 className="font-bold text-gray-900">
  Inhoud teamtas{" "}
  {teamBags.find((bag) => bag.id === selectedTeamBagId)?.bag_number}
</h3>

<p className="mt-1 text-sm text-gray-600">
  {teamBags.find((bag) => bag.id === selectedTeamBagId)?.name}
</p>
{(() => {
  const selectedBag = teamBags.find(
    (bag) => bag.id === selectedTeamBagId
  );

  if (!selectedBag?.holder_name) {
    return null;
  }

  return (
    <div className="mt-3 grid gap-2 text-sm text-gray-600 md:grid-cols-4">
      <div>
        <span className="font-medium text-gray-900">
          Uitgegeven aan:
        </span>{" "}
        {selectedBag.holder_name}{" "}
        {selectedBag.holder_last_name ?? ""}
      </div>

      <div>
        <span className="font-medium text-gray-900">
          E-mail:
        </span>{" "}
        {selectedBag.holder_mail ?? "-"}
      </div>

      <div>
        <span className="font-medium text-gray-900">
          Telefoon:
        </span>{" "}
        {selectedBag.holder_phone ?? "-"}
      </div>

      <div>
        <span className="font-medium text-gray-900">
          Uitgegeven op:
        </span>{" "}
        {selectedBag.issued_at
          ? new Date(selectedBag.issued_at).toLocaleDateString("nl-NL")
          : "-"}
      </div>
{selectedBag.returned_at && (
  <div>
    <span className="font-medium text-gray-900">
      Ingenomen op:
    </span>{" "}
    {new Date(selectedBag.returned_at).toLocaleDateString("nl-NL")}
  </div>
)}
    </div>
  );
})()}
    <div className="mt-4 overflow-x-auto">
  <table className="w-full text-left">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-4 py-3 text-sm font-medium text-gray-600">
          Kledingstuk
        </th>
        <th className="px-4 py-3 text-sm font-medium text-gray-600">
          Maat
        </th>
        <th className="px-4 py-3 text-sm font-medium text-gray-600">
          Verwacht
        </th>
        <th className="px-4 py-3 text-sm font-medium text-gray-600">
          Aanwezig
        </th>
        <th className="px-4 py-3 text-sm font-medium text-gray-600">
          Beschadigd
        </th>
      </tr>
    </thead>

    <tbody>
    {teamBagContents
  .filter((item) => item.team_bag_id === selectedTeamBagId)
  .sort((a, b) => {
    const articleA =
      articleTypes.find((article) => article.id === a.article_type_id)?.name ?? "";
    const articleB =
      articleTypes.find((article) => article.id === b.article_type_id)?.name ?? "";

    const articleCompare = articleA.localeCompare(articleB);

    if (articleCompare !== 0) {
      return articleCompare;
    }

    const sizeIndexA = sizes.findIndex((size) => size.id === a.size_id);
    const sizeIndexB = sizes.findIndex((size) => size.id === b.size_id);

    return sizeIndexA - sizeIndexB;
  })
  .map((item) => {
          const article = articleTypes.find(
            (article) => article.id === item.article_type_id
          );

          const size = sizes.find(
            (size) => size.id === item.size_id
          );

          return (
            <tr
              key={item.id}
              className="border-b border-gray-100"
            >
              <td className="px-4 py-3 text-gray-900">
                {article?.name ?? "Onbekend kledingstuk"}
              </td>

              <td className="px-4 py-3 text-gray-600">
                {size?.name ?? "-"}
              </td>

              <td className="px-4 py-3 text-gray-600">
                {item.expected_quantity}
              </td>

             <td className="px-4 py-3 text-gray-600">
  <input
    type="number"
    min="0"
    value={teamBagReturnActual[item.id] ?? item.actual_quantity}
    onChange={(e) =>
      setTeamBagReturnActual((current) => ({
        ...current,
        [item.id]: Number(e.target.value),
      }))
    }
    className="w-20 rounded-lg border border-gray-300 px-2 py-1"
  />
</td>

             <td className="px-4 py-3 text-gray-600">
  <input
    type="number"
    min="0"
    value={teamBagReturnDamaged[item.id] ?? item.damaged_quantity}
    onChange={(e) =>
      setTeamBagReturnDamaged((current) => ({
        ...current,
        [item.id]: Number(e.target.value),
      }))
    }
    className="w-20 rounded-lg border border-gray-300 px-2 py-1"
  />
</td>
            </tr>
          );
        })}
    </tbody>
  </table>
<h3 className="mt-4 text-sm font-bold text-gray-900">
  Nieuwe kleding toevoegen of innemen
</h3>
<div className="mt-4 flex flex-wrap items-center gap-3">
  <select
    value={newBagArticleId ?? ""}
    onChange={(e) =>
      setNewBagArticleId(
        e.target.value ? Number(e.target.value) : null
      )
    }
    className="rounded-lg border border-gray-300 px-3 py-2"
  >
   {articleTypes
  .filter((article) =>
    [5, 6, 7, 19].includes(article.id)
  )
  .map((article) => (
    <option key={article.id} value={article.id}>
      {article.name}
    </option>
  ))}
  </select>

  <select
    value={newBagSizeId ?? ""}
    onChange={(e) =>
      setNewBagSizeId(
        e.target.value ? Number(e.target.value) : null
      )
    }
    className="rounded-lg border border-gray-300 px-3 py-2"
  >
    <option value="">Kies maat</option>
    {sizes.map((size) => (
      <option key={size.id} value={size.id}>
        {size.name}
      </option>
    ))}
  </select>

  <input
    type="number"
    min="1"
    value={newBagQuantity}
    onChange={(e) =>
      setNewBagQuantity(
        Math.max(1, Number(e.target.value))
      )
    }
    className="w-24 rounded-lg border border-gray-300 px-3 py-2"
  />

  <button
    type="button"
    onClick={addTeamBagContent}
    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
  >
    Toevoegen
  </button>
<button
  type="button"
  onClick={removeTeamBagContent}
className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
>
  Innemen
</button>
{teamBagContentMessage && (
  <p
    className={`text-sm ${
      teamBagContentMessage.toLowerCase().includes("succes")
        ? "text-green-600"
        : "text-red-600"
    }`}
  >
    {teamBagContentMessage}
  </p>
)}
</div>
</div> 
<div className="mt-6 border-t border-gray-200 pt-4">
  <h3 className="font-bold text-gray-900">
    Tas uitgegeven aan
  </h3>

  <div className="mt-3 flex flex-wrap items-center gap-3">
 <input
  type="text"
  placeholder="Voornaam"
  value={teamBagHolderName}
  onChange={(e) => setTeamBagHolderName(e.target.value)}
  className="rounded-lg border border-gray-300 px-3 py-2"
/>

<input
  type="text"
  placeholder="Achternaam"
  value={teamBagHolderLastName}
  onChange={(e) => setTeamBagHolderLastName(e.target.value)}
  className="rounded-lg border border-gray-300 px-3 py-2"
/>
    <input
      type="email"
      placeholder="E-mailadres"
      value={teamBagHolderMail}
      onChange={(e) => setTeamBagHolderMail(e.target.value)}
      className="rounded-lg border border-gray-300 px-3 py-2"
    />

    <input
      type="tel"
      placeholder="Telefoonnummer"
      value={teamBagHolderPhone}
      onChange={(e) => setTeamBagHolderPhone(e.target.value)}
      className="rounded-lg border border-gray-300 px-3 py-2"
    />

    <button
      type="button"
      onClick={issueTeamBag}
      className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
    >
      Tas uitgeven
    </button>
{teamBagIssueMessage && (
<div
  className={`w-full text-sm ${
    teamBagIssueMessage.includes("succesvol")
      ? "text-green-600"
      : "text-red-600"
  }`}
>
    {teamBagIssueMessage}
  </div>
)}
<div className="mt-4 w-full border-t border-gray-200 pt-4">
  <button
    type="button"
    onClick={returnTeamBag}
    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
  >
    Tas innemen
  </button>

  {teamBagReturnMessage && (
  <div
  className={`mt-2 text-sm ${
    teamBagReturnMessage.includes("succesvol")
      ? "text-green-600"
      : "text-red-600"
  }`}
>
      {teamBagReturnMessage}
    </div>
  )}
</div>
  </div>
</div>
 </div>
)}
</div>
)}
{activeSection === "personen" && (<>
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
{message === "Persoon is succesvol toegevoegd." && (
  <p className="mt-2 text-sm text-green-600">
    {message}
  </p>
)}
  </div>
</div>
<div className="mt-8 overflow-hidden rounded-2xl bg-white shadow">
  <div className="border-b border-gray-200 px-6 py-4">
    <h2 className="text-xl font-bold text-gray-900">
      Personen
    </h2>
  </div>
<div className="border-b border-gray-200 px-6 py-4">
  <input
    type="text"
    value={memberSearch}
    onChange={(e) => setMemberSearch(e.target.value)}
    placeholder="Zoek op voor- of achternaam"
    className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 text-sm"
  />
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
{selectedMemberFoundItems.length > 0 && (
  <div className="border-b border-gray-200 bg-yellow-50 px-6 py-4">
    <p className="font-semibold text-yellow-800">
      Gevonden kleding
    </p>

    {selectedMemberFoundItems.map((foundItem) => {
      const assignment = currentAssignments.find(
        (assignment) =>
          assignment.member_id === selectedMemberId &&
          foundItem.individual_item_id ===
            inventoryItems.find(
              (item) => item.unique_number === assignment.unique_number
            )?.id
      );

      return (
        <div key={foundItem.id} className="mt-2 text-sm text-yellow-800">
          <p>
            {assignment?.article ?? "Kledingstuk"} — nummer{" "}
            {assignment?.unique_number ?? "-"}
          </p>

          {foundItem.note && (
            <p className="mt-1">
              Notitie: {foundItem.note}
            </p>
          )}
<button
  type="button"
  onClick={() => markFoundItemReturned(foundItem.id)}
  className="mt-3 rounded-lg border border-yellow-700 px-3 py-1.5 text-sm font-medium text-yellow-800 hover:bg-yellow-100"
>
  Teruggegeven
</button>
        </div>
      );
    })}
  </div>
)}
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
   className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
  >
    Innemen
  </button>
</div>
  </div>
))}
    </div>
{Object.values(returnMessages).map((returnMessage) => (
  <p
    key={returnMessage}
    className="mt-2 text-sm text-green-600"
  >
    {returnMessage}
  </p>
))}
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
      {Object.entries(groupedClothingDetails)

  .map(([groupKey, items]) => {
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

  </>
) : (
    <span className="text-sm text-gray-400">Compleet</span>
  )}
{issueMessages[groupKey] && (
<div
  className={`mt-2 text-sm ${
    issueMessages[groupKey]?.includes("succesvol")
      ? "text-green-600"
      : "text-red-600"
  }`}
>
    {issueMessages[groupKey]}
  </div>
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
</>)}
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

      <div className="mt-3 flex items-center gap-2">
  <img
    src="/sc-leovardia-logo.jpg"
    alt="S.C. Leovardia"
    className="h-10 w-10 rounded-full object-cover"
  />
  <span className="text-sm font-medium text-gray-600">
    sc Leovardia
  </span>
</div>

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
<div className="text-right">
  <button
    type="button"
onClick={handleForgotPassword}
    className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:underline"
  >
    Wachtwoord vergeten?
  </button>
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