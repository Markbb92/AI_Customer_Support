import { handleSignIn } from "@/app/lib/handle-sign-in"
 
export default function SignIn() {
  
  return (
    <form
      action={handleSignIn}
    >
      <button type="submit">Signin with Google</button>
    </form>
  )
} 