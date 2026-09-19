import React, { useState } from 'react';
import { 
  Trash2, 
  RotateCcw, 
  Database, 
  Eye, 
  RefreshCw, 
  User,
  BookOpen
} from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrashTableSkeleton } from '@/components/ui/skeletons';
import ReModal from '@/components/ui/ReModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { 
  useGetArchiveLogsQuery, 
  useRestoreArchiveRecordMutation, 
  useDeleteArchiveRecordMutation 
} from '@/store/api/auditApi';
import { useToast } from '@/components/ui/Toast';
import Tooltip from '@/components/ui/Tooltip';
import PageHeader from '@/components/common/PageHeader';
import Pagination from '@/components/common/Pagination';

export interface ArchiveRecordItem {
  id: number;
  fromModel: string;
  originalRecordId?: number | string;
  originalRecord?: Record<string, unknown>;
  createdAt?: string;
}

const TrashPage: React.FC = () => {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<ArchiveRecordItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data, isLoading, refetch } = useGetArchiveLogsQuery({ page });
  const [restoreRecord, { isLoading: isRestoring }] = useRestoreArchiveRecordMutation();
  const [deleteRecord, { isLoading: isDeleting }] = useDeleteArchiveRecordMutation();

  const archives = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  const handleRestore = async (id: number) => {
    try {
      const res = await restoreRecord(id).unwrap();
      toast({ 
        type: 'success', 
        title: 'Record Restored!', 
        message: `Archived ${res?.restoredModel || 'item'} has been re-inserted into active database.` 
      });
      refetch();
    } catch {
      toast({ type: 'error', title: 'Restore Failed', message: 'Could not restore archived record.' });
    }
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const handlePermanentDelete = (id: number) => {
    setDeleteConfirmId(id);
  };

  const confirmPermanentDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteRecord(deleteConfirmId).unwrap();
      toast.info('Permanently Erased', 'Archive entry purged.');
      refetch();
    } catch {
      toast.error('Purge Failed', 'Could not delete archive entry.');
    }
  };

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
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Database Trash & Archive Recovery"
        description="Safely inspect soft-deleted records from the archive table and restore them to live tables with 1-click."
        icon={<Trash2 className="text-rose-500" size={22} />}
        action={
          <Button variant="outline" size="sm" onClick={() => refetch()} className="h-9 gap-1.5">
            <RefreshCw size={14} /> Refresh Trash
          </Button>
        }
      />

      {/* JSON Payload Inspector Modal */}
      <ReModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Archived Payload Inspector"
        description={`Archive Record #${selectedRecord?.id} | Model: ${selectedRecord?.fromModel}`}
      >
        {selectedRecord && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/60">
              <div>
                <span className="text-muted-foreground">Original Model:</span>
                <span className="ml-2 font-bold text-foreground">{selectedRecord.fromModel}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Archived On:</span>
                <span className="ml-2 font-mono text-foreground">{formatDate(selectedRecord.createdAt)}</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Original Record Data (JSON)
              </label>
              <pre className="p-3 rounded-lg bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-60 border border-border/80">
                {JSON.stringify(selectedRecord.originalRecord || selectedRecord, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button 
                size="sm"
                variant="outline"
                className="text-rose-600 hover:bg-rose-500/10"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handlePermanentDelete(selectedRecord.id);
                }}
              >
                Permanently Delete
              </Button>
              <Button 
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 font-semibold"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleRestore(selectedRecord.id);
                }}
              >
                <RotateCcw size={14} /> Restore to Database
              </Button>
            </div>
          </div>
        )}
      </ReModal>

      {/* Data Table */}
      <Card className="border-border/60 bg-card shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border/60 flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Database size={14} className="text-primary" /> Soft-Deleted Records in Archive Table ({meta.total})
          </span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/60">
                <TableHead className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Archive ID</TableHead>
                <TableHead className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Original Model</TableHead>
                <TableHead className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Original Content / Identifier</TableHead>
                <TableHead className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Deleted Timestamp</TableHead>
                <TableHead className="px-6 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recovery Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/60">
              {isLoading ? (
                <TrashTableSkeleton rows={4} />
              ) : archives.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-36 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Trash is empty. No deleted records currently in archive storage.
                  </TableCell>
                </TableRow>
              ) : (
                archives.map((arch: ArchiveRecordItem) => {
                  const payload = (arch.originalRecord || {}) as Record<string, string>;
                  const identifier = payload.word || payload.email || payload.fullName || JSON.stringify(arch.originalRecordId);

                  return (
                    <TableRow key={arch.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="px-6 py-3.5 font-mono text-xs font-bold text-foreground">
                        #{arch.id}
                      </TableCell>
                      <TableCell className="px-6 py-3.5">
                        <Badge 
                          variant="outline"
                          className={`text-[10px] font-mono ${
                            arch.fromModel === 'Word' 
                              ? 'border-blue-500/30 text-blue-500 bg-blue-500/10' 
                              : 'border-purple-500/30 text-purple-500 bg-purple-500/10'
                          }`}
                        >
                          {arch.fromModel === 'Word' ? <BookOpen size={10} className="mr-1 inline" /> : <User size={10} className="mr-1 inline" />}
                          {arch.fromModel || 'Record'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-3.5 text-xs font-medium text-foreground">
                        {identifier}
                      </TableCell>
                      <TableCell className="px-6 py-3.5 font-mono text-xs text-muted-foreground">
                        {formatDate(arch.createdAt)}
                      </TableCell>
                      <TableCell className="px-6 py-3.5 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setSelectedRecord(arch); setIsDetailModalOpen(true); }}
                            className="h-7 text-xs gap-1"
                          >
                            <Eye size={12} /> Inspect
                          </Button>
                          <div className="flex justify-end gap-1">
                            <Tooltip content="Restore Record to Database" side="top">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRestore(arch.id)}
                                disabled={isRestoring}
                                className="h-7 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 gap-1 font-semibold"
                              >
                                <RotateCcw size={12} /> Restore
                              </Button>
                            </Tooltip>

                            <Tooltip content="Permanently Delete Record" side="top">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handlePermanentDelete(arch.id)}
                                disabled={isDeleting}
                                className="h-7 text-xs text-rose-500 hover:bg-rose-500/10"
                              >
                                <Trash2 size={12} />
                              </Button>
                            </Tooltip>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <Pagination
          page={page}
          totalPages={meta.totalPages}
          onPageChange={setPage}
          totalItems={meta.total}
        />
      </Card>

      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmPermanentDelete}
        title="Permanently Delete Record"
        description="Are you sure you want to permanently delete this archive record? This CANNOT be undone."
        confirmText="Permanently Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default TrashPage;
