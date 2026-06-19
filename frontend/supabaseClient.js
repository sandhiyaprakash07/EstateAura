import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ldopgrtrzkyjnypduzhk.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxkb3BncnRyemt5am55cGR1emhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0OTY2MzgsImV4cCI6MjA5NzA3MjYzOH0.qxTkrYnyZlTwYGreAd3p7r2b10o_E7tKZVlse7878UU";

export const supabase = createClient(supabaseUrl, supabaseKey);