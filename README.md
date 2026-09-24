# DotTo

_Every story detail, connected._

DotTo is a writing companion for authors building rich, interconnected worlds. Upload the documents that shape your story, from outlines and character sheets to setting notes, individual chapters, or an entire manuscript.

Those materials will be organized into a graph-backed RAG knowledge base, connecting the people, places, plotlines, and relationships that matter across your work. Rather than hunting through folders and notes, writers will be able to explore how each detail relates to the rest of the story.

DotTo will also provide a chat experience for talking directly with your story: examine a character's motivations, trace a relationship, test plot continuity, revisit a setting, or follow a thread through the narrative. It is designed to help writers keep the dots visible as their worlds grow.

## Architecture

DotTo is planned as a set of connected layers:

- **Document storage and ingestion:** An S3-compatible object store will retain uploaded files. Their contents will be parsed into searchable passages and identified story entities, such as characters, places, events, and chapters.
- **Vector retrieval:** Embedded text from those passages will live in a vector database, providing the semantic retrieval layer for retrieval-augmented generation (RAG).
- **Story knowledge graph:** Entities and their connections will be stored alongside the source material, making relationships and narrative context available for exploration and retrieval.
- **Graph exploration:** Graphing libraries will visualize the links between characters, settings, events, and plotlines, giving writers a navigable view of their story world.
- **Grounded story chat and writing tools:** Chat will retrieve relevant passages and graph connections so its responses stay rooted in the story. Planned writing tools will use that same context to help authors develop their work in real time.

Together, these layers are intended to support precise source-aware answers, higher-level exploration of the threads that connect a manuscript, and active support while it is being written.

## Database migrations

Drizzle migrations are stored in `drizzle/`. Generate a migration after each schema change, review the generated SQL, and apply reviewed migrations through the deployment workflow:

```sh
pnpm db:generate
pnpm db:migrate
```

Do not use `pnpm db:push` against production databases. It bypasses the reviewed migration history.

Projects use UUID primary keys. Before deploying this schema to a populated database that has integer project IDs, create and review a dedicated data migration that adds UUID values, updates every dependent foreign key and external reference, and only then swaps the primary key. The initial generated migration is a baseline for new environments and must not be applied directly to an existing database.
