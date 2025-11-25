import {type Meta, type StoryObj} from "@storybook/react";
import {ResizablePanelGroup, ResizablePanel, ResizableHandle} from "./resizable";

const meta: Meta<typeof ResizablePanelGroup> = {
  title: "UI/Resizable",
  component: ResizablePanelGroup,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof ResizablePanelGroup>;

export const Default: Story = {
  render: () => (
    <ResizablePanelGroup direction="horizontal" className="max-w-md rounded-lg border">
      <ResizablePanel defaultSize={50}>
        <div className="flex h-[200px] items-center justify-center p-6">
          <span className="font-semibold">One</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>
        <div className="flex h-[200px] items-center justify-center p-6">
          <span className="font-semibold">Two</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const WithHandle: Story = {
  render: () => (
    <ResizablePanelGroup direction="horizontal" className="max-w-md rounded-lg border">
      <ResizablePanel defaultSize={50}>
        <div className="flex h-[200px] items-center justify-center p-6">
          <span className="font-semibold">Left Panel</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <div className="flex h-[200px] items-center justify-center p-6">
          <span className="font-semibold">Right Panel</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const Vertical: Story = {
  render: () => (
    <ResizablePanelGroup direction="vertical" className="min-h-[200px] max-w-md rounded-lg border">
      <ResizablePanel defaultSize={25}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Header</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={75}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Content</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const ThreePanels: Story = {
  render: () => (
    <ResizablePanelGroup direction="horizontal" className="max-w-2xl rounded-lg border">
      <ResizablePanel defaultSize={25}>
        <div className="flex h-[200px] items-center justify-center p-6">
          <span className="font-semibold">Sidebar</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <div className="flex h-[200px] items-center justify-center p-6">
          <span className="font-semibold">Main Content</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={25}>
        <div className="flex h-[200px] items-center justify-center p-6">
          <span className="font-semibold">Inspector</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const Nested: Story = {
  render: () => (
    <ResizablePanelGroup direction="horizontal" className="max-w-2xl rounded-lg border">
      <ResizablePanel defaultSize={30}>
        <div className="flex h-[300px] items-center justify-center p-6">
          <span className="font-semibold">Sidebar</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={70}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={30}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Header</span>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={70}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Main Content</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const CodeEditor: Story = {
  render: () => (
    <div className="max-w-4xl">
      <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
        <ResizablePanel defaultSize={20} minSize={15}>
          <div className="flex h-[400px] flex-col bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center justify-center border-b h-10 text-sm font-medium">
              Explorer
            </div>
            <div className="flex-1 p-3">
              <div className="space-y-1 text-sm">
                <div>📁 src</div>
                <div className="pl-4">📄 App.tsx</div>
                <div className="pl-4">📄 index.tsx</div>
                <div>📁 components</div>
                <div className="pl-4">📄 Button.tsx</div>
                <div>📄 package.json</div>
              </div>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={60}>
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-center border-b h-10 text-sm font-medium">
                  App.tsx
                </div>
                <div className="flex-1 bg-slate-950 text-slate-50 p-4 font-mono text-sm">
                  <div>import React from 'react';</div>
                  <div></div>
                  <div>function App() {`{`}</div>
                  <div>  return (</div>
                  <div>    &lt;div&gt;Hello World&lt;/div&gt;</div>
                  <div>  );</div>
                  <div>{`}`}</div>
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={40}>
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-center border-b h-10 text-sm font-medium">
                  Terminal
                </div>
                <div className="flex-1 bg-black text-green-400 p-4 font-mono text-sm">
                  <div>$ npm start</div>
                  <div>Starting development server...</div>
                  <div>✓ Compiled successfully!</div>
                  <div></div>
                  <div>Local: http://localhost:3000</div>
                  <div>_</div>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={20} minSize={15}>
          <div className="flex h-[400px] flex-col bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center justify-center border-b h-10 text-sm font-medium">
              Properties
            </div>
            <div className="flex-1 p-3">
              <div className="space-y-2 text-sm">
                <div className="font-medium">Element</div>
                <div className="text-slate-600 dark:text-slate-400">div</div>
                <div className="font-medium">Classes</div>
                <div className="text-slate-600 dark:text-slate-400">container</div>
                <div className="font-medium">Styles</div>
                <div className="text-slate-600 dark:text-slate-400">display: flex</div>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
};

export const MinMaxSizes: Story = {
  render: () => (
    <ResizablePanelGroup direction="horizontal" className="max-w-md rounded-lg border">
      <ResizablePanel defaultSize={50} minSize={20} maxSize={80}>
        <div className="flex h-[200px] items-center justify-center p-6">
          <span className="font-semibold text-center">
            Min: 20%<br/>Max: 80%
          </span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50} minSize={20} maxSize={80}>
        <div className="flex h-[200px] items-center justify-center p-6">
          <span className="font-semibold text-center">
            Min: 20%<br/>Max: 80%
          </span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};