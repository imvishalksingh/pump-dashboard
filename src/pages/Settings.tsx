// pages/Settings.tsx
import { PageHeader } from "@/components/Shared/PageHeader";
import { SettingsForm } from "@/components/Settings/SettingsForm";

const Settings = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings"
        description="Configure global system preferences and company information"
      />
      <SettingsForm />
    </div>
  );
};

export default Settings;