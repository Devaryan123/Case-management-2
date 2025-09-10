"use client";
import React from "react";
import { useEffect } from "react";
import { useRouter } from "next/router";
const router = useRouter();

useEffect(() => {
  router.push("/dashboard");
}, [router]);
const page = () => {
  return <div></div>;
};

export default page;
