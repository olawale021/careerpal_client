import React from "react";

interface DetailItemProps {
    icon: React.ElementType;
    label: string;
    value: string;
  }

  const DetailItem: React.FC<DetailItemProps> = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <Icon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  </div>
);

export default DetailItem;
