export interface OrderContext {
  serviceId: string;
  providerId: string;
  networkId?: string;
}

// Temporary mapping. Storefront service IDs ("airtime", "data") and the
// order store's canonical IDs ("svc-airtime", "svc-mtn-data") do not share
// a source today. This file is the bridge. When services-admin.ts exports
// a canonical slug map, replace this.

export function mapServiceId(storefrontServiceId: string): string {
  if (storefrontServiceId === "airtime") return "svc-airtime";
  if (storefrontServiceId === "data") return "svc-mtn-data";
  if (storefrontServiceId === "electricity") return "svc-ecg";
  if (storefrontServiceId === "cabletv") return "svc-dstv";
  if (storefrontServiceId === "exampins") return "svc-waec";
  return "svc-" + storefrontServiceId;
}

export function mapNetworkId(network?: string): string | undefined {
  if (!network) return undefined;
  if (network === "MTN") return "net-mtn";
  if (network === "Telecel") return "net-telecel";
  if (network === "AirtelTigo") return "net-airteltigo";
  return undefined;
}

export function mapProviderId(
  canonicalServiceId: string,
  network?: string
): string {
  if (canonicalServiceId === "svc-ecg") return "prov-ecg-gh";
  if (canonicalServiceId === "svc-dstv" || canonicalServiceId === "svc-gotv") {
    return "prov-multichoice";
  }
  if (canonicalServiceId === "svc-waec") return "prov-waec";
  if (network === "MTN") return "prov-mtn-gh";
  if (network === "Telecel") return "prov-telecel-gh";
  if (network === "AirtelTigo") return "prov-airteltigo-gh";
  return "prov-mtn-gh";
}

export function resolveOrderContext(
  storefrontServiceId: string,
  network?: string
): OrderContext {
  const serviceId = mapServiceId(storefrontServiceId);
  return {
    serviceId,
    providerId: mapProviderId(serviceId, network),
    networkId: mapNetworkId(network),
  };
}