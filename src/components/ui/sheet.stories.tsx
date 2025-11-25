import { type Meta, type StoryObj } from "@storybook/react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";
import { Button } from "./button";
import { Label } from "./label";
import { Input } from "./input";

const meta: Meta<typeof Sheet> = {
  title: "UI/Sheet",
  component: Sheet,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Sheet>;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value="Pedro Duarte" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input id="username" value="@peduarte" className="col-span-3" />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const Sides: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Left</Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Left sheet</SheetTitle>
            <SheetDescription>
              This sheet slides in from the left.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
      
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Right</Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Right sheet</SheetTitle>
            <SheetDescription>
              This sheet slides in from the right.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
      
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Top</Button>
        </SheetTrigger>
        <SheetContent side="top">
          <SheetHeader>
            <SheetTitle>Top sheet</SheetTitle>
            <SheetDescription>
              This sheet slides in from the top.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
      
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Bottom</Button>
        </SheetTrigger>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Bottom sheet</SheetTitle>
            <SheetDescription>
              This sheet slides in from the bottom.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Small</Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Small sheet</SheetTitle>
            <SheetDescription>
              This is a smaller sheet variant.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
      
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Large</Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Large sheet</SheetTitle>
            <SheetDescription>
              This is a larger sheet variant with more space for content.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-8">
            <p className="text-sm text-muted-foreground">
              Large sheets are useful for displaying more complex forms or detailed information.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  ),
};

export const WithScrollableContent: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Terms of Service</Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Terms of Service</SheetTitle>
          <SheetDescription>
            Please read our terms of service carefully.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i}>
              <h3 className="font-medium">Section {i + 1}</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis 
                nostrud exercitation ullamco laboris.
              </p>
            </div>
          ))}
        </div>
        <SheetFooter className="mt-6">
          <SheetClose asChild>
            <Button>Accept</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};
