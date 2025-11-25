import { type Meta, type StoryObj } from "@storybook/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import { Button } from "./button";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const Simple: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Simple Card</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This is a simple card with minimal content.</p>
      </CardContent>
    </Card>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Enter your details to create a new account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Name</label>
          <input className="w-full px-3 py-2 border rounded-md" placeholder="John Doe" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <input className="w-full px-3 py-2 border rounded-md" type="email" placeholder="john@example.com" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Create</Button>
      </CardFooter>
    </Card>
  ),
};

export const Notification: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full" />
          <CardTitle className="text-base">New notification</CardTitle>
        </div>
        <CardDescription>You have 3 unread messages</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="link" className="p-0 h-auto">
          View messages →
        </Button>
      </CardContent>
    </Card>
  ),
};
