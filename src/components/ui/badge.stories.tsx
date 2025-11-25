import { type Meta, type StoryObj } from "@storybook/react";
import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: "Badge",
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="destructive">Destructive</Badge>
    </div>
  ),
};

export const Examples: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Status:</span>
        <Badge variant="outline">In Progress</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Priority:</span>
        <Badge variant="destructive">High</Badge>
        <Badge variant="secondary">Medium</Badge>
        <Badge>Low</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge>React</Badge>
        <Badge>TypeScript</Badge>
        <Badge>Next.js</Badge>
        <Badge>Tailwind CSS</Badge>
      </div>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge className="gap-1">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        Active
      </Badge>
      <Badge variant="secondary" className="gap-1">
        <span className="h-2 w-2 rounded-full bg-yellow-500" />
        Pending
      </Badge>
      <Badge variant="outline" className="gap-1">
        <span className="h-2 w-2 rounded-full bg-gray-500" />
        Inactive
      </Badge>
    </div>
  ),
};
