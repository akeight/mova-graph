import {
    describe,
    expect,
    it,
  } from "vitest";
  
  import {
    workspaceIdSchema,
    workspaceSnapshotSchema,
  } from "./workspace";
  
  const validSnapshot = {
    version: 1 as const,
  
    selectedRoleId:
      "product-engineer",
  
    profile: {
      id: "student-1",
      name: "Student",
      program: "Software Engineering",
  
      courses: [
        {
          id: "course-1",
          title: "Web Development",
          status: "completed" as const,
          skillIds: [
            "typescript",
            "react",
          ],
        },
      ],
  
      experiences: [],
  
      skills: [
        {
          id: "typescript",
          name: "TypeScript",
          status:
            "demonstrated" as const,
        },
      ],
    },
  };
  
  describe(
    "workspaceSnapshotSchema",
    () => {
      it("accepts a valid workspace", () => {
        expect(
          workspaceSnapshotSchema.parse(
            validSnapshot,
          ),
        ).toEqual(validSnapshot);
      });
  
      it("rejects unsupported role IDs", () => {
        const result =
          workspaceSnapshotSchema.safeParse({
            ...validSnapshot,
            selectedRoleId:
              "invented-role",
          });
  
        expect(result.success).toBe(false);
      });
  
      it("rejects invalid course progress", () => {
        const result =
          workspaceSnapshotSchema.safeParse({
            ...validSnapshot,
  
            profile: {
              ...validSnapshot.profile,
  
              courses: [
                {
                  ...validSnapshot
                    .profile.courses[0],
  
                  status: "maybe",
                },
              ],
            },
          });
  
        expect(result.success).toBe(false);
      });
    },
  );
  
  describe("workspaceIdSchema", () => {
    it("accepts UUID workspace IDs", () => {
      expect(
        workspaceIdSchema.safeParse(
          "a5f18354-3143-4a5e-a57c-b00e72fb7db6",
        ).success,
      ).toBe(true);
    });
  
    it("rejects arbitrary IDs", () => {
      expect(
        workspaceIdSchema.safeParse(
          "student-1",
        ).success,
      ).toBe(false);
    });
  });