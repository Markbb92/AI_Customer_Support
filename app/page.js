"use client"
import { signIn, signOut, useSession } from "next-auth/react";
import SignIn from "./components/sign-in"
export default function Home() {
  // const { data: session } = useSession();
  // const handleSignIn = () => {
  //   signIn("google", { callbackUrl: "/dashboard" });
  // };

 
     
  return (
    <div>
      {/* {session ? (
        <>
          <p>Signed in as {session.user.email}</p>
          <button onClick={() => signOut()}>Sign out</button>
        </>
      ) : (
        <button onClick={handleSignIn}>Sign in with Google</button>
      )} */}
      <SignIn />
    </div>
  );

}