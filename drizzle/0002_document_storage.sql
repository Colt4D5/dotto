CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
CREATE TYPE "public"."storage_cleanup_status" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TABLE "document_chunks" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_version_id" integer NOT NULL,
	"chunk_index" integer NOT NULL,
	"content" text NOT NULL,
	"token_count" integer NOT NULL,
	"embedding" vector(1536) NOT NULL,
	CONSTRAINT "document_chunks_document_version_id_chunk_index_unique" UNIQUE("document_version_id","chunk_index")
);
--> statement-breakpoint
CREATE TABLE "document_contents" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_version_id" integer NOT NULL,
	"raw_text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "document_contents_document_version_id_unique" UNIQUE("document_version_id")
);
--> statement-breakpoint
CREATE TABLE "document_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"version_number" integer DEFAULT 1 NOT NULL,
	"label" text,
	"storage_key" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"checksum" text,
	"status" "document_status" DEFAULT 'UPLOADING' NOT NULL,
	"failure_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "document_versions_document_id_version_number_unique" UNIQUE("document_id","version_number")
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"document_type" text NOT NULL,
	"current_version_id" integer,
	"status" "document_status" DEFAULT 'UPLOADING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "storage_cleanup_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"storage_key" text NOT NULL,
	"status" "storage_cleanup_status" DEFAULT 'PENDING' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"available_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_document_version_id_document_versions_id_fk" FOREIGN KEY ("document_version_id") REFERENCES "public"."document_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_contents" ADD CONSTRAINT "document_contents_document_version_id_document_versions_id_fk" FOREIGN KEY ("document_version_id") REFERENCES "public"."document_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_current_version_id_document_versions_id_fk" FOREIGN KEY ("current_version_id") REFERENCES "public"."document_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "document_chunks_document_version_id_idx" ON "document_chunks" USING btree ("document_version_id");--> statement-breakpoint
CREATE INDEX "document_chunks_embedding_hnsw_idx" ON "document_chunks" USING hnsw ("embedding" vector_cosine_ops) WITH (m=16,ef_construction=64);--> statement-breakpoint
CREATE INDEX "document_versions_document_id_idx" ON "document_versions" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "documents_project_id_idx" ON "documents" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "storage_cleanup_jobs_available_idx" ON "storage_cleanup_jobs" USING btree ("status","available_at");--> statement-breakpoint
CREATE FUNCTION "validate_document_current_version"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
	IF NEW.current_version_id IS NOT NULL AND NOT EXISTS (
		SELECT 1
		FROM document_versions
		WHERE id = NEW.current_version_id AND document_id = NEW.id
	) THEN
		RAISE EXCEPTION 'Document version % does not belong to document %', NEW.current_version_id, NEW.id;
	END IF;

	RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE TRIGGER "documents_current_version_matches_document"
BEFORE INSERT OR UPDATE OF "current_version_id" ON "documents"
FOR EACH ROW EXECUTE FUNCTION "validate_document_current_version"();--> statement-breakpoint
CREATE FUNCTION "enqueue_deleted_document_version_storage"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
	INSERT INTO storage_cleanup_jobs (storage_key) VALUES (OLD.storage_key);
	RETURN OLD;
END;
$$;--> statement-breakpoint
CREATE TRIGGER "document_versions_enqueue_storage_cleanup"
AFTER DELETE ON "document_versions"
FOR EACH ROW EXECUTE FUNCTION "enqueue_deleted_document_version_storage"();