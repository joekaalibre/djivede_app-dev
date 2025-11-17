// ✅ AdminMediaPage.tsx — Médiathèque Supabase en liste : renommage, drag & drop, preview, suppression
import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  MenuItem,
  Select,
  TextField,
  Dialog,
  DialogContent,
  InputBase,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar
} from "@mui/material";
import { supabase } from "../lib/supabase";
import FileUploadIcon from "@mui/icons-material/CloudUpload";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import ImageIcon from '@mui/icons-material/Image';

const PAGE_SIZE = 12;

const detectType = (fileType: string): string => {
  if (fileType.startsWith("image")) return "image";
  if (fileType.startsWith("audio")) return "audio";
  if (fileType.startsWith("video")) return "video";
  if (fileType === "application/pdf") return "pdf";
  return "other";
};

const AdminMediaPage = () => {
  const dropRef = useRef<HTMLDivElement>(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, file: null });
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>("");

  const fetchMedia = async () => {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    let query = supabase.from("media_library").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(from, to);
    if (filter !== "all") query = query.eq("type", filter);
    if (search.trim()) query = query.ilike("name", `%${search.trim()}%`);
    const { data, error } = await query;
    if (!error && data) setFiles(data);
  };

  useEffect(() => { fetchMedia(); }, [filter, search, page]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const uniqueName = `uploads/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("media").upload(uniqueName, file, { cacheControl: "3600" });
    if (!error) {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/media/${uniqueName}`;
      await supabase.from("media_library").insert({ name: file.name, url, size: file.size, type: detectType(file.type) });
      fetchMedia();
    }
    setUploading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) handleUpload(e.dataTransfer.files[0]);
  };

  const handleCopyUrl = (url: string, name: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(name);
    setTimeout(() => setCopiedUrl(null), 1500);
  };

  const openPreview = (url: string, type: string) => {
    setPreviewUrl(url);
    setPreviewType(type);
  };

  const closePreview = () => {
    setPreviewUrl(null);
    setPreviewType(null);
  };

  const handleDelete = async () => {
    const file = confirmDialog.file;
    if (!file) return;
    const fileName = file.url.split("/media/")[1];
    await supabase.storage.from("media").remove([fileName]);
    await supabase.from("media_library").delete().eq("id", file.id);
    setConfirmDialog({ open: false, file: null });
    fetchMedia();
  };

  const handleRename = async (file: any) => {
    if (!renameValue.trim()) return;
    await supabase.from("media_library").update({ name: renameValue }).eq("id", file.id);
    setRenamingId(null);
    setRenameValue("");
    fetchMedia();
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case "image": return <ImageIcon />;
      case "video": return <VideoLibraryIcon />;
      case "audio": return <AudiotrackIcon />;
      case "pdf": return <PictureAsPdfIcon />;
      default: return <InsertDriveFileIcon />;
    }
  };

  return (
    <Box p={4} ref={dropRef} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      <Typography variant="h4" fontWeight="bold" mb={3}>Médiathèque Admin</Typography>

      <Box display="flex" gap={2} alignItems="center" mb={4}>
        <Button variant="contained" component="label" startIcon={<FileUploadIcon />}>
          Ajouter un fichier<input type="file" hidden onChange={handleFileSelect} />
        </Button>
        <Select value={filter} onChange={(e) => setFilter(e.target.value)} size="small">
          <MenuItem value="all">Tous</MenuItem>
          <MenuItem value="image">Images</MenuItem>
          <MenuItem value="pdf">PDF</MenuItem>
          <MenuItem value="audio">Audio</MenuItem>
          <MenuItem value="video">Vidéo</MenuItem>
        </Select>
        <TextField size="small" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} />
        {uploading && <CircularProgress size={24} />}
      </Box>

      <List>
        {files.map((file) => (
          <ListItem key={file.id} sx={{ borderBottom: '1px solid #e0e0e0' }}>
            <ListItemAvatar onClick={() => openPreview(file.url, file.type)} sx={{ cursor: 'pointer' }}>
              <Avatar variant="rounded">{renderIcon(file.type)}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={renamingId === file.id ? (
                <InputBase
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => handleRename(file)}
                  autoFocus
                />
              ) : file.name}
              secondary={`${(file.size / 1024).toFixed(1)} Ko | ${new Date(file.created_at).toLocaleString()}`}
            />
            <IconButton onClick={() => handleCopyUrl(file.url, file.name)}><ContentCopyIcon fontSize="small" /></IconButton>
            <IconButton onClick={() => openPreview(file.url, file.type)}><VisibilityIcon fontSize="small" /></IconButton>
            <IconButton onClick={() => setConfirmDialog({ open: true, file })}><DeleteIcon fontSize="small" color="error" /></IconButton>
            <IconButton onClick={() => { setRenamingId(file.id); setRenameValue(file.name); }}><EditIcon fontSize="small" /></IconButton>
            {copiedUrl === file.name && (<Typography variant="caption" color="success.main">Copié !</Typography>)}
          </ListItem>
        ))}
      </List>

      <Box mt={4} display="flex" justifyContent="center" gap={2}>
        <Button variant="outlined" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>Précédent</Button>
        <Button variant="outlined" onClick={() => setPage((p) => p + 1)}>Suivant</Button>
      </Box>

      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, file: null })}>
        <DialogContent>
          <Typography variant="body1" mb={2}>
            Supprimer le fichier : <strong>{confirmDialog.file?.name}</strong> ?
          </Typography>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button onClick={() => setConfirmDialog({ open: false, file: null })}>Annuler</Button>
            <Button variant="contained" color="error" onClick={handleDelete}>Supprimer</Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewUrl} onClose={closePreview} maxWidth="md" fullWidth>
        <DialogContent>
          {previewType === "image" && (<img src={previewUrl!} alt="preview" style={{ width: "100%" }} />)}
          {previewType === "video" && (<video src={previewUrl!} controls style={{ width: "100%" }} />)}
          {previewType === "audio" && (<audio src={previewUrl!} controls style={{ width: "100%" }} />)}
          {previewType === "pdf" && (<iframe src={previewUrl!} width="100%" height="600px" title="PDF preview" />)}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AdminMediaPage;
