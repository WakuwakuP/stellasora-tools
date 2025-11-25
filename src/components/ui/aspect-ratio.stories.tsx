import {type Meta, type StoryObj} from "@storybook/react";
import {AspectRatio} from "./aspect-ratio";

const meta: Meta<typeof AspectRatio> = {
  title: "UI/Aspect Ratio",
  component: AspectRatio,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof AspectRatio>;

export const Default: Story = {
  render: () => (
    <div className="w-64">
      <AspectRatio ratio={16 / 9}>
        <div className="flex h-full w-full items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          16:9 Aspect Ratio
        </div>
      </AspectRatio>
    </div>
  ),
};

export const Square: Story = {
  render: () => (
    <div className="w-64">
      <AspectRatio ratio={1}>
        <div className="flex h-full w-full items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          1:1 Square
        </div>
      </AspectRatio>
    </div>
  ),
};

export const Portrait: Story = {
  render: () => (
    <div className="w-64">
      <AspectRatio ratio={3 / 4}>
        <div className="flex h-full w-full items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          3:4 Portrait
        </div>
      </AspectRatio>
    </div>
  ),
};

export const WithImage: Story = {
  render: () => (
    <div className="w-80">
      <AspectRatio ratio={16 / 9}>
        <img
          src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
          alt="Photo by Drew Beamer"
          className="h-full w-full rounded-md object-cover"
        />
      </AspectRatio>
    </div>
  ),
};

export const Gallery: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 w-full max-w-md">
      <AspectRatio ratio={1}>
        <div className="flex h-full w-full items-center justify-center rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
          Photo 1
        </div>
      </AspectRatio>
      <AspectRatio ratio={1}>
        <div className="flex h-full w-full items-center justify-center rounded-md bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
          Photo 2
        </div>
      </AspectRatio>
      <AspectRatio ratio={1}>
        <div className="flex h-full w-full items-center justify-center rounded-md bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
          Photo 3
        </div>
      </AspectRatio>
      <AspectRatio ratio={1}>
        <div className="flex h-full w-full items-center justify-center rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
          Photo 4
        </div>
      </AspectRatio>
    </div>
  ),
};

export const VideoPlayer: Story = {
  render: () => (
    <div className="w-full max-w-2xl">
      <AspectRatio ratio={16 / 9}>
        <div className="flex h-full w-full items-center justify-center rounded-md bg-black text-white">
          <div className="text-center">
            <div className="mb-2">▶️</div>
            <div className="text-sm">Video Player (16:9)</div>
          </div>
        </div>
      </AspectRatio>
    </div>
  ),
};

export const Responsive: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">レスポンシブな画像</h3>
      <div className="w-full max-w-lg">
        <AspectRatio ratio={16 / 9}>
          <div className="flex h-full w-full items-center justify-center rounded-md bg-gradient-to-br from-blue-400 to-purple-600 text-white">
            <div className="text-center">
              <div className="text-2xl mb-2">🖼️</div>
              <div>レスポンシブ画像</div>
              <div className="text-sm opacity-75">16:9 比率を維持</div>
            </div>
          </div>
        </AspectRatio>
      </div>
    </div>
  ),
};