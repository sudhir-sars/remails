// pages/api/hello_world.js
import postgres from "postgres";
import { NextResponse, NextRequest } from 'next/server';

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;


const conn = postgres({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: "require",
});


export default conn;
