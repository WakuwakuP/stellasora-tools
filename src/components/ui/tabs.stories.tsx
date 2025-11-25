import { type Meta, type StoryObj } from "@storybook/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Label } from "./label";
import { Input } from "./input";
import { Button } from "./button";

const meta: Meta<typeof Tabs> = {
  title: "UI/Tabs",
  component: Tabs,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Make changes to your account here. Click save when you're done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="John Doe" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="username">Username</Label>
              <Input id="username" defaultValue="@johndoe" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password here. After saving, you'll be logged out.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="current">Current password</Label>
              <Input id="current" type="password" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">New password</Label>
              <Input id="new" type="password" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

export const WithoutCard: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-full">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1" className="mt-4">
        <h3 className="text-lg font-medium">First Tab</h3>
        <p className="text-sm text-muted-foreground mt-2">
          This is the content of the first tab.
        </p>
      </TabsContent>
      <TabsContent value="tab2" className="mt-4">
        <h3 className="text-lg font-medium">Second Tab</h3>
        <p className="text-sm text-muted-foreground mt-2">
          This is the content of the second tab.
        </p>
      </TabsContent>
      <TabsContent value="tab3" className="mt-4">
        <h3 className="text-lg font-medium">Third Tab</h3>
        <p className="text-sm text-muted-foreground mt-2">
          This is the content of the third tab.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

export const FullWidth: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <div className="space-y-4 mt-4">
          <h3 className="text-2xl font-bold">Overview</h3>
          <p>Welcome to your dashboard overview.</p>
        </div>
      </TabsContent>
      <TabsContent value="analytics">
        <div className="space-y-4 mt-4">
          <h3 className="text-2xl font-bold">Analytics</h3>
          <p>View your analytics and metrics here.</p>
        </div>
      </TabsContent>
      <TabsContent value="reports">
        <div className="space-y-4 mt-4">
          <h3 className="text-2xl font-bold">Reports</h3>
          <p>Generate and view reports.</p>
        </div>
      </TabsContent>
      <TabsContent value="notifications">
        <div className="space-y-4 mt-4">
          <h3 className="text-2xl font-bold">Notifications</h3>
          <p>Manage your notification preferences.</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};
