/** STAR backend interface */
export interface PatchIpOwner {
  publicity_restriction?: boolean | number;
  requires_futher_development?: boolean | number;
  asset_ip_owner?: number;
  asset_ip_owner_description?: string | null;
  potential_asset_description?: string | null;
  requires_futher_development_description?: string | null;
  publicity_restriction_description?: string | null;
  potential_asset?: boolean | number;
  private_sector_engagement_id?: number;
  formal_ip_rights_application_id?: number;
}

export interface IpRightsPayload extends PatchIpOwner {
  /**
   * Not returned by GET — use `general_information.indicator_id` in templates.
   * Kept only for isolated section demos.
   */
  indicator_id?: number;

  /** Optional PDF enrichment when backend sends only numeric IDs */
  asset_ip_owner_name?: string;
  private_sector_engagement_name?: string;
  formal_ip_rights_application_name?: string;

  publicity_restriction_label?: string;
  potential_asset_label?: string;
  requires_futher_development_label?: string;

  /** @deprecated Prefer asset_ip_owner_name — kept for older demo payloads */
  asset_ip_owner_label?: string;
  /** @deprecated Prefer private_sector_engagement_name */
  private_sector_engagement_label?: string;
  /** @deprecated Prefer formal_ip_rights_application_name */
  formal_ip_rights_application_label?: string;
}
