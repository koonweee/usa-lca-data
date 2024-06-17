import { FilterUsingBackend } from "@/components/filter-using-backend";
import { Button } from "@/components/ui/button";
import {
  PaginatedEmployersDocument,
  PaginatedEmployersQuery,
  PaginatedEmployersQueryVariables,
} from "@/graphql/generated";
import { useQuery } from "@apollo/client";
import React from "react";
import { useDebounce } from "use-debounce";

export default function App() {
  /** Setup stuff */
  const [fakeConsoleText, setFakeConsoleText] = React.useState("");
  const fakeLog = (text: string) => {
    setFakeConsoleText((prevText) => `${prevText}\n${text}`);
  };

  return (
    <div className="flex flex-col p-8 gap-2 w-[800px]">
      Test page
      <div className="w-[600px] bg-pink-600 p-6"></div>
      <Button onClick={() => setFakeConsoleText("")}>Clear console</Button>
      <div className="text-xs whitespace-break-spaces bg-gray-500 text-white font-mono p-4 rounded">
        {fakeConsoleText}
      </div>
    </div>
  );
}
