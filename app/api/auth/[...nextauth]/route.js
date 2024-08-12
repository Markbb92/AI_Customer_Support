import { handlers } from "@/auth"
if (!handlers) {
    throw new Error("handlers is undefined");
  }
export const { GET, POST } =handlers

//import { handlers } from "@/../auth" /

