import AdminHeader from "./_components/AdminHeader";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AdminHeader />
      {children}
    </>
  );
};

export default layout;
