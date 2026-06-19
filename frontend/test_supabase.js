import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ldopgrtrzkyjnypduzhk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxkb3BncnRyemt5am55cGR1emhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0OTY2MzgsImV4cCI6MjA5NzA3MjYzOH0.qxTkrYnyZlTwYGreAd3p7r2b10o_E7tKZVlse7878UU";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const columnsToTest = [
  "uid",
  "auth_id",
  "created_by",
  "profile_id",
  "account_id",
  "user",
  "owner"
];

async function test() {
  for (const col of columnsToTest) {
    const payload = {
      property_id: 1,
      name: "Test",
      email: "test@example.com",
      message: "Test",
      [col]: "test_val"
    };
    
    const { error } = await supabase.from("inquiries").insert([payload]);
    if (error && error.message.includes("Could not find the")) {
      console.log(`❌ Column '${col}' does NOT exist.`);
    } else {
      console.log(`✅ Column '${col}' EXISTS (or returned RLS/other error: ${error ? error.message : "Success!"})`);
    }
  }
}

test();
