import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="system"
      position="top-center"
      richColors
      closeButton
      toastOptions={{ duration: 3000 }}
      {...props}
    />
  );
};

export { Toaster };
