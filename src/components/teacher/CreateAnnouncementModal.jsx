import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import RichTextEditor from '../ui/rich-text-editor';
import { X, Mail, Megaphone, Sparkles, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import announcementsService from '../../services/announcementsService';

export default function CreateAnnouncementModal({ isOpen, onClose, classId, onSuccess, editingAnnouncement = null }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [],
    send_email: true
  });

  // Populate form when editing
  useEffect(() => {
    if (editingAnnouncement) {
      setFormData({
        title: editingAnnouncement.title || '',
        content: editingAnnouncement.content || '',
        tags: editingAnnouncement.tags || [],
        send_email: editingAnnouncement.send_email ?? true
      });
    } else {
      setFormData({
        title: '',
        content: '',
        tags: [],
        send_email: true
      });
    }
  }, [editingAnnouncement]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      const announcementData = {
        join_code: classId,
        title: formData.title.trim(),
        content: formData.content.trim(),
        tags: formData.tags,
        send_email: formData.send_email
      };

      let response;
      if (editingAnnouncement) {
        response = await announcementsService.updateAnnouncement(editingAnnouncement.id, announcementData);
      } else {
        response = await announcementsService.createAnnouncement(classId, announcementData);
      }
      
      if (response.success) {
        toast({
          title: 'Success',
          description: editingAnnouncement ? 'Announcement updated successfully!' : 'Announcement created successfully!',
        });
        
        // Reset form
        setFormData({
          title: '',
          content: '',
          tags: [],
          send_email: true
        });
        
        onSuccess && onSuccess(response.data.announcement);
        onClose();
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create announcement. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Megaphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {editingAnnouncement ? 'Update your announcement' : 'Share important updates with your class'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-muted">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 min-h-0">
            <div className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-foreground">
                  Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter announcement title"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Academic Tags
                </Label>
                <div className="flex flex-wrap gap-2">
                  {['Daily Work', 'Exam', 'Content Covered', 'Assignment', 'Project', 'Quiz', 'Lecture', 'Discussion', 'Reminder', 'Important'].map((tag) => (
                    <Button
                      key={tag}
                      type="button"
                      variant={formData.tags.includes(tag) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          tags: prev.tags.includes(tag) 
                            ? prev.tags.filter(t => t !== tag)
                            : [...prev.tags, tag]
                        }));
                      }}
                      className="h-8 text-xs"
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select relevant academic tags for this announcement
                </p>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-medium text-foreground">
                  Content *
                </Label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  placeholder="Enter announcement content... Use Markdown formatting for rich text!"
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.content.length} characters • Use Markdown for formatting
                </p>
              </div>

              {/* Email Notification */}
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-border bg-muted/30">
                <Checkbox
                  id="send_email"
                  checked={formData.send_email}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, send_email: checked }))}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <div className="flex-1">
                  <Label htmlFor="send_email" className="flex items-center gap-2 cursor-pointer">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="font-medium">Send email notification</span>
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    All class members will receive an email with this announcement
                  </p>
                </div>
              </div>

              {/* Preview */}
              {formData.title && formData.content && (
                <Card className="border-border bg-muted/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Preview
                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {formData.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground text-sm">{formData.title}</h3>
                      <div className="text-xs text-muted-foreground leading-relaxed max-h-20 overflow-y-auto prose prose-xs max-w-none dark:prose-invert">
                        <ReactMarkdown>{formData.content}</ReactMarkdown>
                      </div>
                      {formData.send_email && (
                        <div className="flex items-center gap-2 text-xs text-primary bg-primary/10 px-2 py-1 rounded-md w-fit">
                          <Mail className="h-3 w-3" />
                          <span>Email notification will be sent</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30 flex-shrink-0">
            <div className="text-xs text-muted-foreground">
              {formData.title && formData.content ? (
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                  Ready to publish
                </span>
              ) : (
                <span>Fill in the required fields to continue</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="hover:bg-muted">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !formData.title.trim() || !formData.content.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Megaphone className="h-4 w-4 mr-2" />
                    {editingAnnouncement ? 'Update Announcement' : 'Create Announcement'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
