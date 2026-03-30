path = Path("src/features/tasks/TaskDrawer.tsx")
text = path.read_text(encoding="utf-8")

old_imports = """import { Button } from \"@/components/ui/button\";
import type { BuildWireTask } from \"@/types/task\";
import { taskPriorityTKey, taskWorkflowTKey } from \"@/features/tasks/fixtures\";"""
new_imports = """import { Avatar, Button } from \"@/components/ui\";
import { Select } from \"@/components/ui/select\";
import type { BuildWireTask, TaskPriorityKey, TaskStatus } from \"@/types/task\";
import {
  TASK_COLUMNS,
  taskPriorityTKey,
  taskWorkflowTKey,
} from \"@/features/tasks/fixtures\";"""
if old_imports not in text:
    raise SystemExit('import block1 missing')
text = text.replace(old_imports, new_imports, 1)

old_demo = """import {
  demoPrimaryAssigneeName,
  demoPrimaryInitials,
  demoUserById,
  DEMO_USERS,
} from \"@/features/tasks/demoUsers\";"""
new_demo = """import {
  demoAssigneesDisplayList,
  demoPrimaryAssigneeName,
  demoPrimaryInitials,
  DEMO_USERS,
} from \"@/features/tasks/demoUsers\";"""
if old_demo not in text:
    raise SystemExit('demo import missing')
text = text.replace(old_demo, new_demo, 1)

old_factory = """import { createBuildWireTask } from \"@/features/tasks/taskFactory\";
function fmtShortDate(iso: string): string {"""
new_factory = """import { createBuildWireTask } from \"@/features/tasks/taskFactory\";

function toggleAssigneeId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
}

function fmtShortDate(iso: string): string {"""
if old_factory not in text:
    raise SystemExit('factory block missing')
text = text.replace(old_factory, new_factory, 1)

# CollaborationTab: add useTranslation and t() for strings
old_collab_start = """function CollaborationTab({
  task,
  base,
  statusLabel,
}: {
  task: BuildWireTask;
  base: string;
  statusLabel: string;
}) {
  const thread = ["""
new_collab_start = """function CollaborationTab({
  task,
  base,
  statusLabel,
}: {
  task: BuildWireTask;
  base: string;
  statusLabel: string;
}) {
  const { t } = useTranslation();
  const thread = ["""
if old_collab_start not in text:
    raise SystemExit('collab start missing')
text = text.replace(old_collab_start, new_collab_start, 1)

text = text.replace(
    """      body: `status → ${statusLabel}`,""",
    """      body: t("taskDetailDrawer.demoThreadStatusChange", {
        status: statusLabel,
      }),""",
    1,
)

text = text.replace(
    """        <h3 className="mb-3 text-sm font-semibold text-primary">Discussion</h3>""",
    """        <h3 className="mb-3 text-sm font-semibold text-primary">
          {t("taskDetailDrawer.discussion")}
        </h3>""",
    1,
)

text = text.replace(
    """            placeholder="Write a comment…"
            className="min-w-0 flex-1 rounded-lg border border-border/60 bg-bg px-3 py-2.5 text-sm text-primary placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/30"
          />
          <button
            type="button"
            className="shrink-0 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white dark:text-bg"
          >
            Post
          </button>""",
    """            placeholder={t("taskDetailDrawer.writeComment")}
            className="min-w-0 flex-1 rounded-lg border border-border/60 bg-bg px-3 py-2.5 text-sm text-primary placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/30"
          />
          <button
            type="button"
            className="shrink-0 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white dark:text-bg"
          >
            {t("taskDetailDrawer.post")}
          </button>""",
    1,
)

text = text.replace(
    """        <span className="text-muted">Following</span>""",
    """        <span className="text-muted">{t("taskDetailDrawer.following")}</span>""",
    1,
)

text = text.replace(
    """        <button
          type="button"
          className="ml-1 text-sm font-medium text-brand hover:underline"
        >
          Add
        </button>""",
    """        <button
          type="button"
          disabled
          title={t("taskDetailDrawer.uiOnlyHint")}
          className="ml-1 cursor-not-allowed text-sm font-medium text-muted"
        >
          {t("common.add")}
        </button>""",
    1,
)

text = text.replace(
    """        <h3 className="mb-2 text-sm font-semibold text-primary">Floor plan</h3>
        <Link
          to={`${base}/drawings`}
          className="inline-flex text-sm font-medium text-brand hover:underline"
        >
          Open drawings
        </Link>""",
    """        <h3 className="mb-2 text-sm font-semibold text-primary">
          {t("taskDetailDrawer.floorPlan")}
        </h3>
        <Link
          to={`${base}/drawings`}
          className="inline-flex text-sm font-medium text-brand hover:underline"
        >
          {t("taskDetailDrawer.openDrawings")}
        </Link>""",
    1,
)

# CollaborationTabCreate
text = text.replace(
    """        <h3 className="mb-3 text-sm font-semibold text-primary">Discussion</h3>""",
    """        <h3 className="mb-3 text-sm font-semibold text-primary">
          {t("taskDetailDrawer.discussion")}
        </h3>""",
    1,
)

text = text.replace(
    """            placeholder="Write a comment…"
            readOnly""",
    """            placeholder={t("taskDetailDrawer.writeComment")}
            readOnly""",
    1,
)

# Second Post in create - find collab create post button
idx = text.find("function CollaborationTabCreate")
sub = text[idx:]
sub_old = """          >
            Post
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border/40 pt-6 text-sm text-muted">
        <span>Following</span>"""
if sub_old not in sub:
    raise SystemExit('collab create post block missing')
sub_new = """          >
            {t("taskDetailDrawer.post")}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border/40 pt-6 text-sm text-muted">
        <span>{t("taskDetailDrawer.following")}</span>"""
text = text[:idx] + sub.replace(sub_old, sub_new, 1)

text = text.replace(
    """      <div>
        <h3 className="mb-2 text-sm font-semibold text-primary">Floor plan</h3>
        <Link
          to={`${base}/drawings`}
          className="inline-flex text-sm font-medium text-brand hover:underline"
        >
          Open drawings
        </Link>
      </div>
    </div>
  );
}

function TaskSiteCoordinationStrip(""",
    """      <div>
        <h3 className="mb-2 text-sm font-semibold text-primary">
          {t("taskDetailDrawer.floorPlan")}
        </h3>
        <Link
          to={`${base}/drawings`}
          className="inline-flex text-sm font-medium text-brand hover:underline"
        >
          {t("taskDetailDrawer.openDrawings")}
        </Link>
      </div>
    </div>
  );
}

function TaskSiteCoordinationStrip(""",
    1,
)

path.write_text(text, encoding="utf-8")
print('phase1 ok')