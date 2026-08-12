"use client";

import { Button, Card, Input } from "@/components";
import { ThemeContext } from "@/providers";
import { useContext } from "react";

export default function Home() {
  const { toggleTheme } = useContext(ThemeContext);

  return (
    <main
      style={{
        maxWidth: 700,
        margin: "40px auto",
        padding: "0 20px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <Card
        variant="outlined"
        header={
          <div>
            <h2>Account Settings</h2>
            <p>
              Manage your Atlas account.
            </p>
          </div>
        }
        footer={
          <Button>
            Save Changes
          </Button>
        }
      >
        <Input
          label="Email"
          placeholder="Enter your email"
        />
      </Card>

      <Card variant="elevated">
        <h2>Atlas Workspace</h2>

        <p>
          Your workspace is ready.
        </p>
      </Card>

      <Card variant="interactive">
        <h2>Interactive Card</h2>

        <p>
          This card responds to interaction.
        </p>
      </Card>

      <Button onClick={toggleTheme}>
        Toggle Theme
      </Button>
    </main>
  );
}