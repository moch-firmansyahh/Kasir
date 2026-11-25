import { KitchenBoard } from "@/components/kitchen/KitchenBoard";
import { getStoreName } from "@/lib/settings-server";

export default async function DapurPage() {
  const storeName = await getStoreName();

  return <KitchenBoard storeName={storeName} />;
}
