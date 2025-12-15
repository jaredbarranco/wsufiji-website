-- Create upload audit log table for security tracking
CREATE TABLE IF NOT EXISTS upload_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address INET NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX idx_upload_audit_log_created_at ON upload_audit_log(created_at);
CREATE INDEX idx_upload_audit_log_ip_address ON upload_audit_log(ip_address);