"use client";

import { useRef, useState } from "react";
import { observer } from "mobx-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";
// document-editor
import { EditorRefApi, useEditorMarkings } from "@plane/editor";
// types
import { TPage } from "@plane/types";
// ui
import { TOAST_TYPE, getButtonStyling, setToast } from "@plane/ui";
// components
import { LogoSpinner } from "@/components/common";
import { PageHead } from "@/components/core";
import { IssuePeekOverview } from "@/components/issues";
import { PageEditorBody, PageEditorHeaderRoot } from "@/components/pages";
// helpers
import { cn } from "@/helpers/common.helper";
// hooks
import { usePage, useProjectPages } from "@/hooks/store";
import { useAppRouter } from "@/hooks/use-app-router";

const PageDetailsPage = observer(() => {
  // states
  const [sidePeekVisible, setSidePeekVisible] = useState(window.innerWidth >= 768 ? true : false);
  const [editorReady, setEditorReady] = useState(false);
  const [readOnlyEditorReady, setReadOnlyEditorReady] = useState(false);
  // refs
  const editorRef = useRef<EditorRefApi>(null);
  const readOnlyEditorRef = useRef<EditorRefApi>(null);
  // router
  const router = useAppRouter();
  const { workspaceSlug, projectId, pageId } = useParams();
  // store hooks
  const { createPage, getPageById } = useProjectPages();
  const page = usePage(pageId?.toString() ?? "");
  const { access, description_html, id, name } = page;
  // editor markings hook
  const { markings, updateMarkings } = useEditorMarkings();
  // fetch page details
  const { error: pageDetailsError } = useSWR(
    pageId ? `PAGE_DETAILS_${pageId}` : null,
    pageId ? () => getPageById(pageId.toString()) : null,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  if ((!page || !id) && !pageDetailsError)
    return (
      <div className="size-full grid place-items-center">
        <LogoSpinner />
      </div>
    );

  if (pageDetailsError)
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        <h3 className="text-lg font-semibold text-center">Page not found</h3>
        <p className="text-sm text-custom-text-200 text-center mt-3">
          The page you are trying to access doesn{"'"}t exist or you don{"'"}t have permission to view it.
        </p>
        <Link
          href={`/${workspaceSlug}/projects/${projectId}/pages`}
          className={cn(getButtonStyling("neutral-primary", "md"), "mt-5")}
        >
          View other Pages
        </Link>
      </div>
    );

  const handleCreatePage = async (payload: Partial<TPage>) => await createPage(payload);

  const handleDuplicatePage = async () => {
    const formData: Partial<TPage> = {
      name: "Copy of " + name,
      description_html: description_html ?? "<p></p>",
      access,
    };

    await handleCreatePage(formData)
      .then((res) => router.push(`/${workspaceSlug}/projects/${projectId}/pages/${res?.id}`))
      .catch(() =>
        setToast({
          type: TOAST_TYPE.ERROR,
          title: "Error!",
          message: "Page could not be duplicated. Please try again later.",
        })
      );
  };

  return (
    <>
      <PageHead title={name} />
      <div className="flex h-full flex-col justify-between">
        <div className="h-full w-full flex-shrink-0 flex flex-col overflow-hidden">
          <PageEditorHeaderRoot
            editorRef={editorRef}
            readOnlyEditorRef={readOnlyEditorRef}
            editorReady={editorReady}
            readOnlyEditorReady={readOnlyEditorReady}
            handleDuplicatePage={handleDuplicatePage}
            markings={markings}
            page={page}
            sidePeekVisible={sidePeekVisible}
            setSidePeekVisible={(state) => setSidePeekVisible(state)}
          />
          <PageEditorBody
            editorRef={editorRef}
            handleEditorReady={(val) => setEditorReady(val)}
            readOnlyEditorRef={readOnlyEditorRef}
            handleReadOnlyEditorReady={() => setReadOnlyEditorReady(true)}
            markings={markings}
            page={page}
            sidePeekVisible={sidePeekVisible}
            updateMarkings={updateMarkings}
          />
          <IssuePeekOverview />
        </div>
      </div>
    </>
  );
});

export default PageDetailsPage;
