"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { mockActiveSessions, mockBlockedIPs } from "@/lib/admin/mock/security";

export function SessionsAndIPs() {
  const [sessions, setSessions] = useState(mockActiveSessions);
  const [blockedIPs, setBlockedIPs] = useState(mockBlockedIPs);
  const [sessionSearch, setSessionSearch] = useState("");
  const [ipSearch, setIpSearch] = useState("");

  const handleEndSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const handleUnblockIP = (id: string) => {
    setBlockedIPs(prev => prev.filter(ip => ip.id !== id));
  };

  const filteredSessions = sessions.filter(s =>
    !sessionSearch ||
    s.user.toLowerCase().includes(sessionSearch.toLowerCase()) ||
    s.ip.includes(sessionSearch) ||
    s.device.toLowerCase().includes(sessionSearch.toLowerCase())
  );

  const filteredIPs = blockedIPs.filter(ip =>
    !ipSearch ||
    ip.ip.includes(ipSearch) ||
    ip.reason.toLowerCase().includes(ipSearch.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Active Sessions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Sessions</CardTitle>
          <Input
            placeholder="Search sessions..."
            className="max-w-[160px] h-8"
            value={sessionSearch}
            onChange={e => setSessionSearch(e.target.value)}
          />
        </CardHeader>
        <CardContent className="space-y-2">
          {filteredSessions.length === 0 ? (
            <p className="text-sm text-neutral-400">No active sessions.</p>
          ) : (
            filteredSessions.map(session => (
              <div key={session.id} className="flex items-center justify-between rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                <div>
                  <p className="font-medium">{session.user}</p>
                  <p className="text-xs text-neutral-500">{session.device} · {session.ip}</p>
                </div>
                <div className="flex items-center gap-2">
                  {session.current && <Badge variant="success">Current</Badge>}
                  {!session.current && (
                    <Button variant="outline" size="sm" onClick={() => handleEndSession(session.id)}>End Session</Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Blocked IPs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Blocked IPs</CardTitle>
          <Input
            placeholder="Search IPs..."
            className="max-w-[140px] h-8"
            value={ipSearch}
            onChange={e => setIpSearch(e.target.value)}
          />
        </CardHeader>
        <CardContent className="space-y-2">
          {filteredIPs.length === 0 ? (
            <p className="text-sm text-neutral-400">No blocked IPs.</p>
          ) : (
            filteredIPs.map(ip => (
              <div key={ip.id} className="flex items-center justify-between rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                <div>
                  <p className="font-mono text-sm">{ip.ip}</p>
                  <p className="text-xs text-neutral-500">{ip.reason}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleUnblockIP(ip.id)}>Unblock</Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}