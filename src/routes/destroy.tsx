import type { ActionFunctionArgs } from "react-router-dom";
import { redirect } from "react-router-dom";
import { toast } from "sonner";
import { deleteProduct } from "../api";

export async function action({ params }: ActionFunctionArgs) {
  await deleteProduct(params.id as string);
  toast.success("Product successfully deleted");
  return redirect("/products");
}

export function Component() {
  return null;
}
