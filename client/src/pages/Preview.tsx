import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2Icon } from "lucide-react";
import ProjectPreview from "../components/ProjectPreview";
import type { Project } from "../types";
// Modified by KIRO-CLI
import api from "@/configs/axios";
import { toast } from "sonner";

const Preview = () => {

  const [loading, setLoading] = useState(true);
  const { projectId, versionId } = useParams();
  const [code, setCode] = useState('');

  // Modified by KIRO-CLI: fetch real project from GET /api/project/preview/:projectId
  // and pick the requested version's code when a versionId is present.
  const fetchCode = async () => {
    try {
      if (!projectId) throw new Error('Project ID is missing.');
      const { data } = await api.get<{ project: Project }>(
        `/api/project/preview/${projectId}`,
      );
      const project = data.project;
      if (!project) throw new Error('Project not found.');

      let resolvedCode = project.current_code || '';
      if (versionId) {
        const version = project.versions?.find((v) => v.id === versionId);
        if (version) resolvedCode = version.code;
      }
      setCode(resolvedCode);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, versionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2Icon className="size-7 animate-spin text-indigo-200" />
      </div>
    );
  }

  return (
    <div className="h-screen">
      {code && (
        <ProjectPreview
          project={{ current_code: code } as Project}
          isGenerating={false}
          showEditorPanel={false}
        />
      )}
    </div>
  );
}

export default Preview
