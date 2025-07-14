import Image from "next/image";
import { SignInButton, SignOutButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main>
      <SignInButton />
      <SignOutButton />
    </main>
  );
}
