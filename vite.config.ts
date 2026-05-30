import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tailwindcss from '@tailwindcss/vite' // Si usas v4

import { config } from  "dotenv" 
config () 

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()
  ],
  define : { 
    'process.env' : process. env
   }, 
})
