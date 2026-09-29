import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Project } from '../types';
import { ArrowBigDownDashIcon, EyeIcon, EyeOffIcon, FullscreenIcon, LaptopIcon, Loader2Icon, MessageSquareIcon, SaveIcon, SmartphoneIcon, TabletIcon, XIcon } from 'lucide-react';
import api from '@/configs/axios';
import Sidebar from '../components/Sidebar';
import ProjectPreview, { type ProjectPreviewRef } from '../components/ProjectPreview';
import logo from '../assets/ai_5278402.png'; // Modified by KIRO-CLI
import { toast } from 'sonner'; // Modified by KIRO-CLI

const Projects = () => {
  const { projectId } = useParams()
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const [isGenerating, setIsGenerating] = useState(true);
  const [device, setDevice] = useState<'phone' | 'tablet' | 'desktop'>('desktop');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Modified by KIRO-CLI: real saving state

  const loadedProjectId = useRef<string | undefined>(undefined);
  const previewRef = useRef<ProjectPreviewRef>(null)

  // Modified by KIRO-CLI: save manually edited code via PUT /api/project/save/:projectId
  const saveProject = async () => {
    if (isSaving) return;
    const code = previewRef.current?.getCode() || project?.current_code;
    if (!projectId) {
      toast.error('Project ID is missing.');
      return;
    }
    if (!code) {
      toast.error('There is no code to save yet.');
      return;
    }
    try {
      setIsSaving(true);
      const { data } = await api.put(`/api/project/save/${projectId}`, { code });
      setProject((prev) => (prev ? { ...prev, current_code: code, current_version_index: '' } : prev));
      toast.success(data.message || 'Project code saved successfully.');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setIsSaving(false);
    }
  }
  
  // DOWNLOAD CODE {index.html}  
  const downloadCode = () => { 
    const code = previewRef.current?.getCode() || project?.current_code
    if (!code) {
      if (isGenerating) {
        return
      }
      return
    }
    const element = document.createElement(`a`);
    const file = new Blob([code], { type: 'index.html' });
    element.href = URL.createObjectURL(file);
    document.body.appendChild(element);
    element.click();
  }

  // Modified by KIRO-CLI: toggle publish state via GET /api/user/toggle-publish/:projectId
  const togglePublish = async () => {
    if (!projectId) {
      toast.error('Project ID is missing.');
      return;
    }
    try {
      const { data } = await api.get(`/api/user/toggle-publish/${projectId}`);
      setProject((prev) => (prev ? { ...prev, isPublished: !prev.isPublished } : prev));
      toast.success(data.message || 'Publish status updated.');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    }
  }
  
  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const startedAt = Date.now();
    let failures = 0;
    if (loadedProjectId.current !== projectId) {
      setLoading(true);
      setProject(null);
      loadedProjectId.current = projectId;
    }
    setError(null);
    setIsGenerating(true);

    const fetchProject = async () => {
      try {
        if (!projectId) throw new Error('Project ID is missing.');
        const { data } = await api.get<{ project: Project }>(
          `/api/user/project/${projectId}`,
          { signal: controller.signal, timeout: 15000 },
        );
        if (controller.signal.aborted) return;
        if (!data.project) throw new Error('Project not found.');
        failures = 0;
        setError(null);
        setProject(data.project);
        const pending = !data.project.current_code;
        setIsGenerating(pending);
        setLoading(false);
        if (pending) {
          if (Date.now() - startedAt >= 15 * 60 * 1000) {
            setIsGenerating(false);
            setError('Generation is taking longer than expected. Check again to refresh this project.');
          } else {
            timer = setTimeout(fetchProject, 2000);
          }
        }
      }
      catch (error: any) {
        if (controller.signal.aborted) return;
        failures += 1;
        const status = error?.response?.status;
        const canRetry = (!status || status >= 500) && failures < 3;
        const message = error?.response?.data?.message || (
          !error.response ? 'Cannot reach the server. Your saved conversation has been kept.' : 'Unable to load project.'
        );
        setError(canRetry ? `${message} Reconnecting…` : message);
        setLoading(false);
        setIsGenerating(false);
        if (canRetry) timer = setTimeout(fetchProject, 2000);
      }
    };

    void fetchProject();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [projectId, retryCount]);

  if (error && !project) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-screen text-gray-200">
        <p role="alert">{error}</p>
        <button onClick={() => setRetryCount((count) => count + 1)}
          className="rounded bg-indigo-600 px-4 py-2">Check again</button>
        <Link to="/projects">Back to projects</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <>
        <div className='flex items-center justify-center h-screen'>
          <Loader2Icon className='size-7 animate-spin text-violet-200'/>
        </div>
      </>
    )
  }

    return project ? (
      <div className="flex flex-col h-screen w-full bg-gray-900 text-white">
        {error && (
          <div role="alert" className="flex items-center justify-between gap-3 bg-amber-950 px-4 py-3 text-sm text-amber-100">
            <span>{error}</span>
            <button className="shrink-0 underline" onClick={() => setRetryCount((count) => count + 1)}>
              Check again
            </button>
          </div>
        )}
        {/* builder Navbar */}
        <div
          className="flex max-sm:flex-col sm:items-center gap-4 px-4 py-2
        no-scrollbar"
        >
          {/* left */}
          <div className="flex items-center gap-2 sm:min-w-90 text-nowrap">
            <img
              src={logo}
              alt="logo"
              className="h-6 cursor-pointer"
              onClick={() => navigate("/")}
            />
            <div className="max-w-64 sm:max-w-xs">
              <p className="text-sm text-medium capitalize truncate">
                {project.name}
              </p>
              <p className="text-xs text-gray-400 -mt-0.5">
                Previewing last saved version
              </p>
            </div>
            <div className="sm:hidden flex-1 flex justrify-end">
              {isMenuOpen ? (
                <MessageSquareIcon
                  onClick={() => setIsMenuOpen(false)}
                  className="size-6 cursor-pointer"
                />
              ) : (
                <XIcon
                  onClick={() => setIsMenuOpen(true)}
                  className="size-6 cursor-pointer"
                />
              )}
            </div>
          </div>
          {/* middle */}
          <div className="hidden sm:flex gap-2 bg-gray-950 p-1.5 rounded-md ">
            <SmartphoneIcon
              onClick={() => setDevice("phone")}
              className={`size-6 p-1
            rounded cursor-pointer ${device === "phone" ? "bg-gray-700" : ""}`}
            />
            <TabletIcon
              onClick={() => setDevice("tablet")}
              className={`size-6 p-1
            rounded cursor-pointer ${device === "tablet" ? "bg-gray-700" : ""}`}
            />
            <LaptopIcon
              onClick={() => setDevice("desktop")}
              className={`size-6 p-1
            rounded cursor-pointer ${device === "desktop" ? "bg-gray-700" : ""}`}
            />
          </div>
          {/* right */}
          <div className="flex items-center justify-end gap-3 flex-1 text-xs sm:text-sm">
            <button
              onClick={() => saveProject()}
              disabled={isSaving}
              className="max-sm:hidden bg-gray-800 hover:bg-gray-700 text-white px-3.5 py-1
                flex items-center gap-2 rounded sm:rounded-sm transition-colors
                border border-gray-700 hover:border-gray-600"
            >
              {" "}
              {isSaving ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <SaveIcon size={`16`} />
              )}
              Save
            </button>
            <Link
              className="flex gap-2 px-4 py-1 rounded sm:rounded-sm border border-gray-700
                hover:border-gray-500 transition-colors"
              to={`preview/${projectId}`}
              target="_blank"
            >
              <FullscreenIcon size={`16`} />
              Preview
            </Link>
            <button
              onClick={() => downloadCode()}
              className="bg-linear-to-br from-blue-700 to-blue-600
              hover:from-blue-600 hover:from-blue-500 text-white px-3.5 py-1 flex 
              items-center gap-2 rounded sm:rounded-sm transition-colors"
            >
              <ArrowBigDownDashIcon size={`16`} /> Download
            </button>
            <button
              onClick={() => togglePublish()}
              className="bg-linear-to-br from-indigo-700 to-indigo-600
                hover:from-indigo-600 hover:from-indigo-600 text-white px-3.5 py-1 flex
                items-center gap-2 rounded sm:rounded-sm transition-colors"
            >
              {project.isPublished ? (
                <EyeOffIcon size={`16`} />
              ) : (
                <EyeIcon size={`16`} />
              )}{" "}
              {project.isPublished ? "UnPublish" : "Publish"}
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-auto">
          <Sidebar
            isMenuOpen={isMenuOpen} project={project}
            setProject={(p) => setProject(p)}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}/>
          <div className="flex-1 p-2 pl-0"><ProjectPreview ref={previewRef}
            project={project} isGenerating={isGenerating} device={ device }/></div>
        </div>
      </div>
    ) : (
      <div className="flex items-center justify-center h-screen">
        <p className="text-2xl text-gray-200 font-medium">Unable to load</p>
      </div>
    );
}

export default Projects