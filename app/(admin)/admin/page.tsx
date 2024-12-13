import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ROUTES } from "@/constants/general";

const AdminPage = async () => {
  const session = await auth();
  if (!session || !session.user.isAdmin) {
    return redirect(ROUTES.HOME);
  }

  return redirect(ROUTES.MANAGE_PRODUCT);
};

export default AdminPage;
