import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2Icon } from "lucide-react";
import ProjectPreview from "../components/ProjectPreview";
import type { Project } from "../types";
// Modified by KIRO-CLI
import api from "@/configs/axios";
import { toast } from "sonner";

const View = () => {
  const { projectId } = useParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);

  // Modified by KIRO-CLI: fetch published project code from GET /api/project/published/:projectId
  const fetchCode = async () => {
    try {
      if (!projectId) throw new Error('Project ID is missing.');
      const { data } = await api.get<{ code: string }>(
        `/api/project/published/${projectId}`,
      );
      setCode(data.code || '');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchCode()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2Icon className="size-7 animate-spin text-indigo-200"/>
      </div>
    )
  }

    return (
      <div className="h-screen">
        {code && <ProjectPreview project={{ current_code: code } as Project}
        isGenerating={ false } showEditorPanel = {false}/> }
      </div>
    );
}

export default View
