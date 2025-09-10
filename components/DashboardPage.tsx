"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { BriefcaseBusiness, Search } from "lucide-react";
import { useRouter } from "next/navigation";

type Timeline = {
  caseName: string;
  areaOfLaw: string;
  files: File[];
  createdAt: number;
  updatedAt: number;
  _id: Id<'timeline'>;
};

type File = {
  size: string;
  fileName: string;
  url: string;
  createdAt: number;
  updatedAt: number;
  _id: Id<'file'>;
  timelineId:Id<'timeline'>;

};


// const allTimelines = [
//     {
//         title: "Case 1",
//         type: "Criminal law",
//         files: 3,
//         created: "8/9/2025",
//         _id:"1"

//     },
//     {
//         title: "Case 2",
//         type: "Criminal law",
//         files: 3,
//         created: "8/9/2025",
//         _id:"2"
//     },
//     {
//         title: "Case 3",
//         type: "Criminal law",
//         files: 3,
//         created: "8/9/2025",
//         _id:"3"
//     }
// ]

const DashboardPage = () => {
  const router = useRouter();
  const getTimelines = useQuery(api.timeline.getTimeline);

  return (
    <div className="min-h-screen">
      <div className="flex-1 mx-auto">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">My Timelines</h1>
          </div>

          <div className="">
            {/* Header */}
            <div className="flex gap-2 justify-between items-center mb-6">
              <div className="flex justify-between items-center w-10/12 md:w-fit md:gap-3">
                <div className="relative w-4/6 md:w-[280px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="Filter by case..." className="pl-9" />
                </div>
              </div>
              <Button
                onClick={() => router.push("/Timeline")}
                variant="outline"
              >
                <BriefcaseBusiness className="h-4 w-4" strokeWidth={1.5} />
                <span className="hidden md:flex">New Timeline</span>
              </Button>
            </div>

            {/* Content */}
            <div className="border rounded-lg overflow-hidden">
              <Table className="rounded-xl">
                <TableHeader className="border-b rounded-xl bg-muted">
                  <TableRow>
                    <TableHead className="font-medium border-r text-center">
                      Case Title
                    </TableHead>
                    <TableHead className="font-medium border-r text-center">
                      Type
                    </TableHead>
                    <TableHead className="font-medium border-r text-center">
                      Files
                    </TableHead>
                    <TableHead className="font-medium border-r text-center">
                      Created
                    </TableHead>
                    <TableHead className="font-medium text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getTimelines === undefined ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Loading cases...
                      </TableCell>
                    </TableRow>
                  ) : getTimelines === null ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center text-red-500"
                      >
                        Error loading cases
                      </TableCell>
                    </TableRow>
                  ) : getTimelines?.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-[250px] text-center cursor-pointer"
                      >
                        <div className="flex flex-col items-center justify-center h-full space-y-2">
                          <h2 className="text-xl font-semibold">
                            Start Your Case Timeline Journey
                          </h2>
                          <p className="text-gray-500 max-w-md text-center">
                            Create a new timeline to organize and visualize your
                            case events.
                          </p>
                          <Button
                            onClick={() =>
                              router.push("/dashboard/newtimeline")
                            }
                            className="mt-4  flex items-center gap-2"
                          >
                            <BriefcaseBusiness
                              className="h-4 w-4"
                              strokeWidth={1.5}
                            />
                            <span>New Timeline</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    getTimelines?.map((timeline: Timeline) => (
                      <TableRow
                        key={timeline._id}
                        className="cursor-pointer transition-colors "
                        onClick={() =>
                          router.push(`/dashboard/timeline/${timeline._id}`)
                        }
                      >
                        <TableCell className="font-medium border-r text-center">
                          {timeline.caseName}
                        </TableCell>
                        <TableCell className="border-r text-center">
                          {timeline.areaOfLaw}
                        </TableCell>
                        <TableCell className="border-r text-center">
                          <span>{timeline.files[0].fileName}</span>
                        </TableCell>
                        <TableCell className="border-r text-center">
                          {timeline.files[0].size}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
