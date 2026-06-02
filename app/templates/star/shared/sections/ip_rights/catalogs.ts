/** STAR lookup labels for IP owner (IDs from GET `asset_ip_owner`) */
export const ASSET_IP_OWNER_LABELS: Record<number, string> = {
  1: "CGIAR Center",
  2: "Alliance Bioversity & CIAT",
  3: "Third party",
  4: "Other",
};

/** Yes / No / Not sure — used by private sector & formal IP rights (indicator 2) */
export const TRINARY_OPTION_LABELS: Record<number, string> = {
  1: "Yes",
  2: "No",
  3: "Not sure",
};
