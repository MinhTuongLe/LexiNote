import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Database, 
  Eye, 
  RefreshCw
} from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AuditTableSkeleton } from '@/components/ui/skeletons';
import ReModal from '@/components/ui/ReModal';
import { useGetAuditLogsQuery, useGetArchiveLogsQuery } from '@/store/api/auditApi';
import type { AuditLogItem, ArchiveRecordItem } from '@/store/api/auditApi';
import { useToast } from '@/components/ui/Toast';

const AuditLogPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'audit' | 'archive'>('audit');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [targetFilter, setTargetFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | ArchiveRecordItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { toast } = useToast();

  const { data: auditData, isLoading: isAuditLoading, refetch: refetchAudit } = useGetAuditLogsQuery({
    page,
    search,
    action: actionFilter,
    targetType: targetFilter,
  }, { skip: activeTab !== 'audit' });

  const { data: archiveData, isLoading: isArchiveLoading, refetch: refetchArchive } = useGetArchiveLogsQuery({
    page,
  }, { skip: activeTab !== 'archive' });

  const logs = auditData?.data || [];
  const auditMeta = auditData?.meta || { total: 0, totalPages: 1 };

  const archives = archiveData?.data || [];
  const archiveMeta = archiveData?.meta || { total: 0, totalPages: 1 };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A';
    const num = Number(dateStr);
    const date = !isNaN(num) && num > 0 ? new Date(num) : new Date(dateStr);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionBadgeClass = (action: string) => {
    if (action.includes('DELETE') || action.includes('REVOKE')) {
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    }
    if (action.includes('TOGGLE') || action.includes('UPDATE')) {
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    }
    return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="text-primary" size={24} /> Audit Trail & System Logs
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Immutable system operation logs, security event traces, and archived records.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            if (activeTab === 'audit') refetchAudit();
            else refetchArchive();
            toast({ type: 'info', title: 'Logs Refreshed', message: 'Audit trail synchronized.' });
          }}
          className="h-9 gap-1.5"
        >
          <RefreshCw size={14} /> Refresh Logs
        </Button>
      </div>

      {/* Audit Detail Modal */}
      <ReModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Audit Log Entry Inspector"
        description={`Log ID #${selectedLog?.id || ''} | ${
          selectedLog && 'action' in selectedLog 
            ? `Action: ${selectedLog.action}` 
            : `Model: ${(selectedLog as ArchiveRecordItem | null)?.fromModel || ''}`
        }`}
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/30 border border-border/60">
              <div>
                <span className="text-muted-foreground">Actor ID / Email:</span>
                <p className="font-semibold text-foreground mt-0.5">
                  {'action' in selectedLog 
                    ? (selectedLog.actorEmail || `Actor #${selectedLog.actorId || 'System'}`)
                    : 'System Archivist'}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Timestamp:</span>
                <p className="font-mono text-foreground mt-0.5">{formatDate(selectedLog.createdAt)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Target Type & ID:</span>
                <p className="font-mono text-foreground mt-0.5">
                  {'action' in selectedLog 
                    ? `${selectedLog.targetType}${selectedLog.targetId ? ` #${selectedLog.targetId}` : ''}`
                    : (selectedLog as ArchiveRecordItem).fromModel}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">IP Address:</span>
                <p className="font-mono text-foreground mt-0.5">
                  {'action' in selectedLog ? (selectedLog.ipAddress || '127.0.0.1') : '127.0.0.1'}
                </p>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Event Payload & Metadata (JSON)
              </label>
              <pre className="p-3 rounded-lg bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-60 border border-border/80">
                {JSON.stringify(
                  'action' in selectedLog 
                    ? (selectedLog.details || selectedLog) 
                    : ((selectedLog as ArchiveRecordItem).originalRecord || selectedLog),
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        )}
      </ReModal>

      {/* Tabs */}
      <div className="flex border-b border-border text-sm">
        <button
          className={`py-2.5 px-5 border-b-2 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => { setActiveTab('audit'); setPage(1); }}
        >
          <ShieldCheck size={16} /> Audit Trail ({auditMeta.total})
        </button>
        <button
          className={`py-2.5 px-5 border-b-2 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'archive'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => { setActiveTab('archive'); setPage(1); }}
        >
          <Database size={16} /> Archived Records ({archiveMeta.total})
        </button>
      </div>

      {activeTab === 'audit' && (
        <Card className="border-border/60 bg-card shadow-xs overflow-hidden">
          {/* Controls */}
          <div className="p-4 border-b border-border/60 flex flex-wrap items-center justify-between gap-4">
            <div className="relative max-w-sm w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={15} />
              <Input
                placeholder="Search audit trail by actor, action..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full bg-muted/40 border-border/80 rounded-lg h-9 pl-9 pr-3 text-xs font-medium focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={actionFilter}
                onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                className="bg-muted/40 border border-border/80 rounded-lg h-9 px-3 text-xs font-medium text-foreground focus:outline-none"
              >
                <option value="ALL">All Action Types</option>
                <option value="USER_TOGGLE_STATUS">USER_TOGGLE_STATUS</option>
                <option value="USER_TOGGLE_VERIFY">USER_TOGGLE_VERIFY</option>
                <option value="USER_DELETE">USER_DELETE</option>
                <option value="WORD_DELETE">WORD_DELETE</option>
                <option value="WORD_UPDATE">WORD_UPDATE</option>
                <option value="SESSION_REVOKE">SESSION_REVOKE</option>
                <option value="USER_REVOKE_ALL_SESSIONS">USER_REVOKE_ALL_SESSIONS</option>
              </select>

              <select
                value={targetFilter}
                onChange={(e) => { setTargetFilter(e.target.value); setPage(1); }}
                className="bg-muted/40 border border-border/80 rounded-lg h-9 px-3 text-xs font-medium text-foreground focus:outline-none"
              >
                <option value="ALL">All Target Types</option>
                <option value="USER">USER</option>
                <option value="WORD">WORD</option>
                <option value="USER_SESSION">USER_SESSION</option>
                <option value="SYSTEM_CONFIG">SYSTEM_CONFIG</option>
              </select>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border/60">
                  <TableHead className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Log ID</TableHead>
                  <TableHead className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action Event</TableHead>
                  <TableHead className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actor / Admin</TableHead>
                  <TableHead className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target</TableHead>
                  <TableHead className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timestamp</TableHead>
                  <TableHead className="px-6 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/60">
                {isAuditLoading ? (
                  <AuditTableSkeleton rows={5} />
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      No audit logs match current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log: AuditLogItem) => (
                    <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="px-6 py-3.5 font-mono text-xs font-bold text-foreground">
                        #{log.id}
                      </TableCell>
                      <TableCell className="px-6 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getActionBadgeClass(log.action)}`}>
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-3.5 text-xs font-medium text-foreground">
                        {log.actorEmail || `Actor #${log.actorId || 'System'}`}
                      </TableCell>
                      <TableCell className="px-6 py-3.5 font-mono text-xs text-muted-foreground">
                        {log.targetType}{log.targetId ? ` #${log.targetId}` : ''}
                      </TableCell>
                      <TableCell className="px-6 py-3.5 font-mono text-xs text-muted-foreground">
                        {formatDate(log.createdAt)}
                      </TableCell>
                      <TableCell className="px-6 py-3.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setSelectedLog(log); setIsDetailModalOpen(true); }}
                          className="h-7 text-xs gap-1"
                        >
                          <Eye size={12} /> Inspect
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {auditMeta.totalPages > 1 && (
            <div className="p-4 border-t border-border/60 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Page <span className="font-semibold text-foreground">{page}</span> of <span className="font-semibold text-foreground">{auditMeta.totalPages}</span>
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 text-xs"
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage(p => Math.min(auditMeta.totalPages, p + 1))}
                  disabled={page === auditMeta.totalPages}
                  className="h-8 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'archive' && (
        <Card className="border-border/60 bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border/60">
                  <TableHead className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID</TableHead>
                  <TableHead className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Original Model</TableHead>
                  <TableHead className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Archived Date</TableHead>
                  <TableHead className="px-6 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Record Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/60">
                {isArchiveLoading ? (
                  <AuditTableSkeleton rows={3} />
                ) : archives.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      No archived database records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  archives.map((arch: ArchiveRecordItem) => (
                    <TableRow key={arch.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="px-6 py-3.5 font-mono text-xs font-bold text-foreground">
                        #{arch.id}
                      </TableCell>
                      <TableCell className="px-6 py-3.5 text-xs font-semibold text-primary">
                        {arch.fromModel || 'Word / User'}
                      </TableCell>
                      <TableCell className="px-6 py-3.5 font-mono text-xs text-muted-foreground">
                        {formatDate(arch.createdAt)}
                      </TableCell>
                      <TableCell className="px-6 py-3.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setSelectedLog(arch); setIsDetailModalOpen(true); }}
                          className="h-7 text-xs gap-1"
                        >
                          <Eye size={12} /> Inspect JSON
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {archiveMeta.totalPages > 1 && (
            <div className="p-4 border-t border-border/60 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Page <span className="font-semibold text-foreground">{page}</span> of <span className="font-semibold text-foreground">{archiveMeta.totalPages}</span>
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 text-xs"
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage(p => Math.min(archiveMeta.totalPages, p + 1))}
                  disabled={page === archiveMeta.totalPages}
                  className="h-8 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Inspect Detail Modal */}
      {selectedLog && (
        <ReModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedLog(null);
          }}
          title={'action' in selectedLog ? `Audit Event: ${selectedLog.action}` : `Archived Record: ${selectedLog.fromModel || 'Data'}`}
          description={'action' in selectedLog ? `Target: ${selectedLog.targetType || 'N/A'} (ID: ${selectedLog.targetId || 'N/A'})` : `Model: ${selectedLog.fromModel || 'N/A'}`}
          footer={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsDetailModalOpen(false);
                setSelectedLog(null);
              }}
            >
              Close
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs bg-muted/30 p-3 rounded-lg border border-border/60">
              <div>
                <span className="text-muted-foreground block">Date & Time:</span>
                <span className="font-semibold text-foreground">{formatDate(selectedLog.createdAt)}</span>
              </div>
              {'ipAddress' in selectedLog && (
                <div>
                  <span className="text-muted-foreground block">IP Address:</span>
                  <span className="font-mono font-semibold text-foreground">{selectedLog.ipAddress || 'Internal'}</span>
                </div>
              )}
              {'actorEmail' in selectedLog && Boolean(selectedLog.actorEmail) && (
                <div className="col-span-2">
                  <span className="text-muted-foreground block">Actor:</span>
                  <span className="font-semibold text-foreground">{selectedLog.actorEmail}</span>
                </div>
              )}
            </div>

            <div>
              <span className="text-xs font-semibold text-muted-foreground block mb-1">Payload / Changes:</span>
              <pre className="p-3 bg-muted/50 rounded-lg text-xs font-mono overflow-auto max-h-64 text-foreground border border-border/60">
                {JSON.stringify('details' in selectedLog ? selectedLog.details : ('originalRecord' in selectedLog ? selectedLog.originalRecord : {}), null, 2)}
              </pre>
            </div>
          </div>
        </ReModal>
      )}
    </div>
  );
};

export default AuditLogPage;
