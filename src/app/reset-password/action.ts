'use server'
//need these to ask supabase to email a password reset link
//using form on the reset pass page
import { cookies, headers } from 'next/headers' 
import { redirect } from 'next/navigation' 
import { createClient } from '@utils/supabase/server' 

