import { type Meta, type StoryObj } from "@storybook/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { Button } from "./button";

const meta: Meta<typeof Tooltip> = {
  title: "UI/Tooltip",
  component: Tooltip,
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Add to library</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const Positions: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Top</Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Tooltip on top</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Bottom</Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Tooltip on bottom</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Left</Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Tooltip on left</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Right</Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Tooltip on right</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const WithDelay: Story = {
  render: () => (
    <div className="flex gap-4">
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button variant="outline">No delay</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Instant tooltip</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip delayDuration={500}>
        <TooltipTrigger asChild>
          <Button variant="outline">500ms delay</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delayed tooltip</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip delayDuration={1000}>
        <TooltipTrigger asChild>
          <Button variant="outline">1s delay</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Long delay tooltip</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const IconButtons: Story = {
  render: () => (
    <div className="flex gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <span className="sr-only">Home</span>
            🏠
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Home</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <span className="sr-only">Settings</span>
            ⚙️
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Settings</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <span className="sr-only">Profile</span>
            👤
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Profile</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const WithKeyboardShortcut: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button>Save</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Save changes</p>
        <p className="text-xs text-muted-foreground mt-1">Ctrl + S</p>
      </TooltipContent>
    </Tooltip>
  ),
};
