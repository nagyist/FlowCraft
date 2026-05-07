-- Adds the `finalized` flag used by the diagrams workbench Finalize & View flow.
-- The dashboard splits diagrams into Finalized vs. Drafts based on this column.

alter table public.diagrams
  add column if not exists finalized boolean not null default false;

create index if not exists diagrams_user_finalized_idx
  on public.diagrams (user_id, finalized);
