import { type Meta, type StoryObj } from "@storybook/react";
import { Progress } from "./progress";
import { useEffect, useState } from "react";

const meta: Meta<typeof Progress> = {
  title: "UI/Progress",
  component: Progress,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  args: {
    value: 60,
  },
};

export const Zero: Story = {
  args: {
    value: 0,
  },
};

export const Complete: Story = {
  args: {
    value: 100,
  },
};

const AnimatedProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  return <Progress value={progress} className="w-full" />;
};

export const Animated: Story = {
  render: () => <AnimatedProgress />,
};

const LoadingSimulation = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full space-y-2">
      <Progress value={progress} />
      <p className="text-sm text-muted-foreground text-center">{progress}%</p>
    </div>
  );
};

export const Loading: Story = {
  render: () => <LoadingSimulation />,
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4 w-full">
      <div>
        <p className="text-sm mb-2">Small</p>
        <Progress value={60} className="h-1" />
      </div>
      <div>
        <p className="text-sm mb-2">Default</p>
        <Progress value={60} />
      </div>
      <div>
        <p className="text-sm mb-2">Large</p>
        <Progress value={60} className="h-4" />
      </div>
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-4 w-full">
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">Uploading files...</span>
          <span className="text-sm text-muted-foreground">33%</span>
        </div>
        <Progress value={33} />
      </div>
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">Processing...</span>
          <span className="text-sm text-muted-foreground">67%</span>
        </div>
        <Progress value={67} />
      </div>
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">Complete!</span>
          <span className="text-sm text-muted-foreground">100%</span>
        </div>
        <Progress value={100} />
      </div>
    </div>
  ),
};
