import { odaProjectInfo } from "@/data/odaMockDataFence";

import { EMAIL_CONTENT_LOGO } from "../shared";

export function EmailScreen({ onContinue }: { onContinue: () => void }) {
  const {
    clientName,
  } = odaProjectInfo;
  const firstName = clientName.split(" ")[0];

  // Icon helpers — matches Figma's overflow-clip 20×20 container with centered shape
  const OI = ({
    src,
    w,
    h,
    sz = 20,
  }: {
    src: string;
    w: number;
    h: number;
    sz?: number;
  }) => (
    <div
      className="overflow-clip relative flex-shrink-0"
      style={{ width: sz, height: sz }}
    >
      <img
        alt=""
        className="absolute block max-w-none pointer-events-none"
        style={{
          width: w,
          height: h,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
        src={src}
      />
    </div>
  );
  // Small chevron (12×12 container)
  const Chev = ({
    src = "/assets/outlook/chevron-sm.svg",
  }: {
    src?: string;
  }) => (
    <div
      className="overflow-clip relative flex-shrink-0"
      style={{ width: 12, height: 12 }}
    >
      <img
        alt=""
        className="absolute block max-w-none pointer-events-none"
        style={{
          width: 8,
          height: 4.5,
          left: "50%",
          top: "calc(50% + 0.75px)",
          transform: "translate(-50%, -50%)",
        }}
        src={src}
      />
    </div>
  );
  const Sep = () => (
    <div
      className="bg-[#e5e5e5] flex-shrink-0"
      style={{ width: 1, height: 32 }}
    />
  );

  const inboxItems = [
    {
      src: "/assets/outlook/send.svg",
      w: 16.35,
      h: 16.13,
      label: "Sent Items",
    },
    {
      src: "/assets/outlook/drafts.svg",
      w: 16,
      h: 16,
      label: "Drafts",
      badge: "2",
    },
  ];
  const folderItems = [
    { src: "/assets/outlook/mail-inbox2.svg", w: 14, h: 14, label: "Inbox" },
    {
      src: "/assets/outlook/folder-junk.svg",
      w: 17,
      h: 16,
      label: "Junk Email",
    },
    {
      src: "/assets/outlook/drafts.svg",
      w: 16,
      h: 16,
      label: "Drafts",
      badge: "2",
    },
    {
      src: "/assets/outlook/send.svg",
      w: 16.35,
      h: 16.13,
      label: "Sent Items",
    },
    {
      src: "/assets/outlook/delete2.svg",
      w: 16,
      h: 16.5,
      label: "Deleted Items",
    },
    { src: "/assets/outlook/archive2.svg", w: 16, h: 14, label: "Archive" },
    { src: "/assets/outlook/note.svg", w: 14, h: 14, label: "Notes" },
    {
      src: "/assets/outlook/folder.svg",
      w: 16,
      h: 14,
      label: "Conversatio...",
    },
  ];

  return (
    <div
      className="flex flex-col w-full h-screen overflow-hidden bg-[#fafafa]"
      style={{
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* ── Navigation Bar ── */}
      <div
        className="flex items-center justify-between flex-shrink-0 bg-[#316ab7]"
        style={{ padding: "8px 8px 8px 14px" }}
      >
        <div className="flex items-center gap-5">
          <OI src="/assets/outlook/grid.svg" w={15.5} h={15.5} />
          <p className="font-semibold text-[16px] text-white leading-[24px] whitespace-nowrap">
            Outlook
          </p>
          {/* Search bar */}
          <div
            className="flex items-center gap-[14px] rounded-[4px] pl-[12px] pb-[7px] pt-[5px]"
            style={{ width: 350, backgroundColor: "rgba(255,255,255,0.7)" }}
          >
            <OI src="/assets/outlook/search.svg" w={14} h={14} />
            <p className="text-[14px] text-[#1b3a5b] leading-[20px]">Search</p>
          </div>
        </div>
        {/* JS avatar */}
        <div
          className="flex items-center justify-center rounded-full border border-white overflow-clip flex-shrink-0 pb-px"
          style={{ width: 32, height: 32 }}
        >
          <p className="text-[14px] text-[#f4f4f4] leading-[14px]">JS</p>
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="flex flex-1 min-h-0">
        {/* Apps Section */}
        <div
          className="flex flex-col gap-[17px] flex-shrink-0 pt-[7px]"
          style={{ width: 49, backgroundColor: "#f0f0f0" }}
        >
          {/* Mail (active) */}
          <div className="flex items-center gap-[10px] pl-[2px] pr-[15px]">
            <div
              className="rounded-[2px] flex-shrink-0 bg-[#316ab7]"
              style={{ width: 2, height: 32 }}
            />
            <OI src="/assets/outlook/mail-blue.svg" w={16} h={13} />
          </div>
          {/* Calendar / People / Attach */}
          <div className="flex flex-col gap-[18px] items-center w-full">
            {[
              { src: "/assets/outlook/calendar.svg", w: 14, h: 14 },
              { src: "/assets/outlook/people.svg", w: 17, h: 13.5 },
              { src: "/assets/outlook/attach.svg", w: 12.6, h: 14.3 },
            ].map((ic, i) => (
              <div
                key={i}
                className="flex items-center justify-center py-[4px] w-full"
              >
                <OI src={ic.src} w={ic.w} h={ic.h} />
              </div>
            ))}
          </div>
          {/* Other apps */}
          <div className="flex flex-col gap-[14px] w-full">
            <div className="flex flex-col gap-[18px]">
              {[
                { src: "/assets/outlook/todo.svg", w: 20, h: 16.5 },
                { src: "/assets/outlook/word.svg", w: 20, h: 20 },
                { src: "/assets/outlook/excel.svg", w: 20, h: 20 },
                { src: "/assets/outlook/powerpoint.svg", w: 20, h: 20 },
                { src: "/assets/outlook/onedrive.svg", w: 20, h: 20 },
              ].map((ic, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center py-[4px] w-full"
                >
                  <OI src={ic.src} w={ic.w} h={ic.h} />
                </div>
              ))}
            </div>
            {/* App Folder */}
            <div className="flex items-center justify-center py-[4px] w-full">
              <OI src="/assets/outlook/app-folder.svg" w={18} h={18} sz={24} />
            </div>
          </div>
        </div>

        {/* Right of apps */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Top Header (Home / View / Help) */}
          <div className="flex items-start flex-shrink-0 pl-[15px]">
            {/* Home — active */}
            <div className="flex flex-col gap-[2px] items-center justify-center pt-[6px] px-[14px]">
              <p className="font-semibold text-[14px] text-[#212121] leading-[20px] whitespace-nowrap">
                Home
              </p>
              <div className="bg-[#316ab7] w-full" style={{ height: 3 }} />
            </div>
            <div className="flex items-center justify-center px-[14px] py-[6px]">
              <p className="text-[14px] text-[#212121] leading-[20px]">View</p>
            </div>
            <div className="flex items-center justify-center px-[14px] py-[6px]">
              <p className="text-[14px] text-[#212121] leading-[20px]">Help</p>
            </div>
          </div>

          {/* Email Actions Toolbar */}
          <div className="flex gap-px items-end pl-[8px] flex-shrink-0">
            <div
              className="bg-white border-[0.25px] border-black/6 flex gap-[36px] items-start px-[14px] py-[4px] flex-1 rounded-[4px]"
              style={{ boxShadow: "0px 2px 4px 0px rgba(0,0,0,0.04)" }}
            >
              {/* New email */}
              <div className="flex gap-[10px] items-center">
                <img
                  src="/assets/outlook/line-horizontal.svg"
                  alt=""
                  className="flex-shrink-0"
                  style={{ width: 20, height: 20 }}
                />
                <div className="flex gap-px items-center">
                  <div className="flex gap-[10px] items-center bg-[#316ab7] rounded-l-[4px] h-[32px] pl-[9px] pr-[12px]">
                    <OI src="/assets/outlook/mail-white.svg" w={16} h={13} />
                    <p className="text-[14px] text-white leading-[20px] whitespace-nowrap">
                      New email
                    </p>
                  </div>
                  <div className="flex items-center justify-center bg-[#316ab7] rounded-r-[4px] px-[6px] py-[8px]">
                    <div
                      className="overflow-clip relative flex-shrink-0"
                      style={{ width: 16, height: 16 }}
                    >
                      <img
                        alt=""
                        className="absolute block max-w-none pointer-events-none"
                        style={{
                          width: 10,
                          height: 5.5,
                          left: "50%",
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                        }}
                        src="/assets/outlook/chevron-white.svg"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* Action groups */}
              <div className="flex gap-[13px] items-start">
                <div className="flex gap-[6px] items-center">
                  <div className="flex gap-[21px] items-start">
                    <div className="flex gap-[7px] items-center">
                      <div className="flex gap-[4px] items-start">
                        <OI src="/assets/outlook/delete.svg" w={16} h={16.5} />
                        <p className="text-[14px] text-[#212121] leading-[20px]">
                          Delete
                        </p>
                      </div>
                      <Chev />
                    </div>
                    <div className="flex gap-[4px] items-center">
                      <OI src="/assets/outlook/archive.svg" w={16} h={14} />
                      <p className="text-[14px] text-black leading-[20px]">
                        Archive
                      </p>
                    </div>
                    <div className="flex gap-[4px] items-start">
                      <OI src="/assets/outlook/report.svg" w={14} h={16} />
                      <p className="text-[14px] text-[#212121] leading-[20px]">
                        Report
                      </p>
                    </div>
                    <div className="flex gap-[4px] items-center">
                      <OI src="/assets/outlook/sweep.svg" w={16.5} h={16.5} />
                      <p className="text-[14px] text-[#212121] leading-[20px]">
                        Sweep
                      </p>
                    </div>
                    <div className="flex gap-[7px] items-center">
                      <div className="flex gap-[4px] items-center">
                        <OI src="/assets/outlook/move-to.svg" w={17} h={16} />
                        <p className="text-[14px] text-[#212121] leading-[20px] whitespace-nowrap">
                          Move to
                        </p>
                      </div>
                      <Chev />
                    </div>
                  </div>
                  <Sep />
                </div>
                <div className="flex gap-[14px] items-start">
                  <div className="flex gap-[6px] items-center">
                    <div className="flex gap-[7px] items-center">
                      <div className="flex gap-[4px] items-start">
                        <OI
                          src="/assets/outlook/reply-all.svg"
                          w={15.5}
                          h={12.24}
                        />
                        <p className="text-[14px] text-[#212121] leading-[20px]">
                          Reply
                        </p>
                      </div>
                      <Chev />
                    </div>
                    <Sep />
                  </div>
                  <div className="flex gap-[21px] items-center">
                    <div className="flex gap-[4px] items-start">
                      <OI src="/assets/outlook/mail-read.svg" w={16} h={14} />
                      <p className="text-[14px] text-[#212121] leading-[20px] whitespace-nowrap">
                        Read / Unread
                      </p>
                    </div>
                    <div className="flex gap-[19px] items-center">
                      <div className="flex gap-[13px] items-start">
                        <div className="flex gap-[4px] items-center">
                          <OI src="/assets/outlook/tag.svg" w={15.6} h={15.6} />
                          <Chev />
                        </div>
                        <div className="flex gap-[5px] items-center">
                          <div
                            className="relative flex-shrink-0"
                            style={{ width: 20, height: 20 }}
                          >
                            <img
                              alt=""
                              className="absolute block max-w-none pointer-events-none"
                              style={{
                                width: 12.5,
                                height: 15,
                                left: "calc(50% - 0.25px)",
                                top: "calc(50% + 0.5px)",
                                transform: "translate(-50%, -50%)",
                              }}
                              src="/assets/outlook/flag.svg"
                            />
                          </div>
                          <Chev />
                        </div>
                        <OI src="/assets/outlook/pin.svg" w={14.97} h={14.97} />
                      </div>
                      <div className="flex gap-[7px] items-center">
                        <div className="flex gap-[4px] items-center">
                          <OI src="/assets/outlook/clock.svg" w={16} h={16} />
                          <Chev />
                        </div>
                        <div className="flex gap-[14px] items-center">
                          <Sep />
                          <div className="opacity-30">
                            <OI src="/assets/outlook/undo.svg" w={13} h={16} />
                          </div>
                          <Sep />
                          <OI src="/assets/outlook/more.svg" w={12.5} h={2.5} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Body: Inbox sidebar + Email panel */}
          <div className="flex flex-1 min-h-0">
            {/* Inbox Organiser */}
            <div
              className="flex flex-col gap-[8px] bg-[#fafafa] flex-shrink-0 overflow-y-auto"
              style={{ padding: "18px 19px 18px 8px" }}
            >
              {/* Favourites */}
              <div className="flex flex-col gap-[12px]">
                <div className="flex gap-[12px] items-center px-[12px]">
                  <div
                    className="overflow-clip relative flex-shrink-0"
                    style={{ width: 16, height: 16 }}
                  >
                    <img
                      alt=""
                      className="absolute block max-w-none pointer-events-none"
                      style={{
                        width: 10,
                        height: 5.5,
                        left: "50%",
                        top: "calc(50% + 0.25px)",
                        transform: "translate(-50%, -50%)",
                      }}
                      src="/assets/outlook/chevron-inbox.svg"
                    />
                  </div>
                  <p className="font-semibold text-[14px] text-[#424242] leading-[20px] whitespace-nowrap">
                    Favourites
                  </p>
                </div>
                <div className="flex flex-col">
                  {/* Inbox (active, highlighted) */}
                  <div className="flex items-start bg-[#d3e3f8] rounded-[4px] pl-[38px] pr-[18px] py-[10px]">
                    <div className="flex flex-1 gap-[8px] items-start">
                      <div
                        className="flex gap-[8px] items-start"
                        style={{ width: 115 }}
                      >
                        <OI
                          src="/assets/outlook/mail-inbox.svg"
                          w={14}
                          h={14}
                        />
                        <p className="font-semibold text-[14px] text-[#424242] leading-[20px] flex-1 min-w-0">
                          Inbox
                        </p>
                      </div>
                      <p
                        className="text-[14px] text-[#265388] leading-[20px]"
                        style={{ width: 8 }}
                      >
                        1
                      </p>
                    </div>
                  </div>
                  {inboxItems.map(({ src, w, h, label, badge }) => (
                    <div
                      key={label}
                      className="flex items-center rounded-[4px] pl-[38px] pr-[18px] py-[10px]"
                    >
                      <div className="flex flex-1 gap-[8px] items-start">
                        <div
                          className="flex gap-[8px] items-center"
                          style={{ width: 115 }}
                        >
                          <OI src={src} w={w} h={h} />
                          <p className="text-[14px] text-[#424242] leading-[20px] flex-1 min-w-0">
                            {label}
                          </p>
                        </div>
                        {badge && (
                          <p
                            className="text-[14px] text-[#424242] leading-[20px]"
                            style={{ width: 8 }}
                          >
                            {badge}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-start rounded-[4px] pl-[66px] pr-[18px] py-[10px]">
                    <p className="text-[14px] text-[#265388] leading-[20px] whitespace-nowrap">
                      Add favourite
                    </p>
                  </div>
                </div>
              </div>
              {/* Folders */}
              <div className="flex flex-col gap-[12px]">
                <div className="flex gap-[12px] items-center px-[12px]">
                  <div
                    className="overflow-clip relative flex-shrink-0"
                    style={{ width: 16, height: 16 }}
                  >
                    <img
                      alt=""
                      className="absolute block max-w-none pointer-events-none"
                      style={{
                        width: 10,
                        height: 5.5,
                        left: "50%",
                        top: "calc(50% + 0.25px)",
                        transform: "translate(-50%, -50%)",
                      }}
                      src="/assets/outlook/chevron-inbox.svg"
                    />
                  </div>
                  <p className="font-semibold text-[14px] text-[#424242] leading-[20px]">
                    Folders
                  </p>
                </div>
                <div className="flex flex-col" style={{ width: 183 }}>
                  {folderItems.map(({ src, w, h, label, badge }) => (
                    <div
                      key={label}
                      className="flex items-center rounded-[4px] pl-[38px] pr-[18px] py-[10px]"
                    >
                      <div className="flex flex-1 gap-[8px] items-start">
                        <div
                          className="flex gap-[8px] items-center"
                          style={{ width: 115 }}
                        >
                          <OI src={src} w={w} h={h} />
                          <p className="text-[14px] text-[#424242] leading-[20px] flex-1 min-w-0">
                            {label}
                          </p>
                        </div>
                        {badge && (
                          <p className="text-[14px] text-[#424242] leading-[20px]">
                            {badge}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-start rounded-[4px] pl-[66px] pr-[18px] py-[10px]">
                    <p className="text-[14px] text-[#265388] leading-[20px] whitespace-nowrap">
                      Create new fol...
                    </p>
                  </div>
                </div>
              </div>
              {/* Groups */}
              <div className="flex flex-col gap-[12px]">
                <div className="flex gap-[12px] items-center px-[12px]">
                  <div
                    className="overflow-clip relative flex-shrink-0"
                    style={{ width: 16, height: 16 }}
                  >
                    <img
                      alt=""
                      className="absolute block max-w-none pointer-events-none"
                      style={{
                        width: 10,
                        height: 5.5,
                        left: "50%",
                        top: "calc(50% + 0.25px)",
                        transform: "translate(-50%, -50%)",
                      }}
                      src="/assets/outlook/chevron-inbox.svg"
                    />
                  </div>
                  <p className="font-semibold text-[14px] text-[#424242] leading-[20px]">
                    Groups
                  </p>
                </div>
                <div
                  className="flex items-start rounded-[4px] pl-[66px] pr-[18px] py-[10px]"
                  style={{ width: 187 }}
                >
                  <p className="text-[14px] text-[#265388] leading-[20px] whitespace-nowrap">
                    New group
                  </p>
                </div>
              </div>
            </div>

            {/* Email Panel */}
            <div className="flex flex-col gap-[8px] flex-1 min-w-0 pb-[16px]">
              {/* Email Header Bar */}
              <div className="bg-white border border-[#f0f0f0] flex flex-col gap-[6px] pt-[12px] rounded-[4px] flex-shrink-0">
                {/* Close / Previous / Next + Zoom */}
                <div className="flex items-start justify-between pl-[21px] pr-[24px]">
                  <div className="flex gap-[22px] items-center pt-[6px]">
                    <div className="flex gap-[7px] items-start">
                      <div
                        className="overflow-clip relative flex-shrink-0"
                        style={{ width: 16, height: 16 }}
                      >
                        <img
                          alt=""
                          className="absolute block max-w-none pointer-events-none"
                          style={{
                            width: 11,
                            height: 11,
                            left: "50%",
                            top: "50%",
                            transform: "translate(-50%, -50%)",
                          }}
                          src="/assets/outlook/dismiss.svg"
                        />
                      </div>
                      <p className="text-[14px] text-[#808080] leading-[16px]">
                        Close
                      </p>
                    </div>
                    <div className="flex gap-[25px] items-start">
                      <div
                        className="bg-[#e0e0e0] flex-shrink-0"
                        style={{ width: 1, height: 18 }}
                      />
                      <div className="flex gap-[21px] items-start text-[14px] leading-[16px] whitespace-nowrap">
                        <p className="text-[#d1d1d1]">Previous</p>
                        <p className="text-[#424242]">Next</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-[3px] items-end">
                    <OI src="/assets/outlook/zoom.svg" w={14} h={14} />
                    <div className="flex items-start pb-px">
                      <Chev src="/assets/outlook/chevron-email.svg" />
                    </div>
                  </div>
                </div>
                {/* Subject */}
                <div className="flex gap-[16px] items-center px-[13px] py-[10px]">
                  <p className="font-semibold text-[20px] text-[#424242] leading-[24px] whitespace-nowrap">
                    Your project proposal is ready to review
                  </p>
                  <div className="flex gap-[4px] items-center">
                    <div
                      className="overflow-clip relative flex-shrink-0"
                      style={{ width: 20, height: 20 }}
                    >
                      <img
                        alt=""
                        className="absolute block max-w-none pointer-events-none"
                        style={{
                          width: 15,
                          height: 17,
                          left: "calc(50% + 0.5px)",
                          top: "calc(50% - 0.5px)",
                          transform: "translate(-50%, -50%)",
                        }}
                        src="/assets/outlook/mail-checkmark.svg"
                      />
                    </div>
                    <div className="flex items-start pt-[3px]">
                      <Chev src="/assets/outlook/chevron-email.svg" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Content (scrollable) */}
              <div className="border border-[#d1d1d1] flex flex-col flex-1 min-h-0 overflow-clip rounded-[4px]">
                {/* Sender info header */}
                <div className="bg-white flex items-center justify-between flex-shrink-0 pb-[13px] pl-[12px] pr-[22px] pt-[15px]">
                  <div className="flex gap-[11px] items-end">
                    <div
                      className="flex flex-col items-center justify-center bg-[#1f5d68] rounded-[42px] flex-shrink-0 pb-[6px] pt-[2px] px-[4px]"
                      style={{ width: 42, height: 42 }}
                    >
                      <p className="font-semibold text-[16px] text-white leading-[16px]">
                        O
                      </p>
                    </div>
                    <div className="flex flex-col gap-[7px] text-[#424242] whitespace-nowrap">
                      <p className="text-[16px] leading-[16px]">{`Madison Fence Company <service@madisonfence.com>`}</p>
                      <div className="flex gap-[6px] items-center text-[14px]">
                        <p>To:</p>
                        <p>You</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-[9px] items-end">
                    <div className="flex gap-[16px] items-start">
                      <OI
                        src="/assets/outlook/reply-hdr.svg"
                        w={15.5}
                        h={12.24}
                      />
                      <OI
                        src="/assets/outlook/reply-all-hdr.svg"
                        w={15.5}
                        h={12.24}
                      />
                      <OI
                        src="/assets/outlook/forward-hdr.svg"
                        w={15.5}
                        h={12.24}
                      />
                      <OI src="/assets/outlook/more-hdr.svg" w={12.5} h={2.5} />
                    </div>
                    <p className="text-[12px] text-[#808080] leading-[16px] whitespace-nowrap">
                      Thu 26/01/2023 05:26
                    </p>
                  </div>
                </div>

                {/* Email body — scrollable */}
                <div className="flex-1 min-h-0 overflow-y-auto bg-white pl-[65px] pr-[28px]">
                  <div className="bg-[#fafafa] w-full" style={{ height: 1 }} />
                  {/* Grey surround */}
                  <div
                    className="bg-[#f0f0f0] flex justify-center py-[31px] w-full"
                  >
                    <div className="flex flex-col" style={{ width: 720 }}>
                      {/* White email card */}
                      <div className="bg-white flex flex-col gap-[27px] items-center pb-[64px] pt-[48px] px-[54px]">
                        <div
                          className="relative flex-shrink-0"
                          style={{ width: 240, height: 240 }}
                        >
                          <img
                            src={EMAIL_CONTENT_LOGO}
                            alt="Madison Fence Company"
                            className="absolute inset-0 block size-full object-cover"
                          />
                        </div>
                        {/* Hi */}
                        <p
                          className="min-w-full text-[12px] text-[rgba(0,0,0,0.85)] leading-[16px]"
                          style={{ fontWeight: 300 }}
                        >
                          Hi {firstName},
                        </p>
                        {/* Body paragraphs */}
                        <div
                          className="min-w-full text-[12px] text-[rgba(0,0,0,0.85)] leading-[20px]"
                          style={{ fontWeight: 300 }}
                        >
                          <p className="mb-[6px]">
                            Your fence project proposal from Madison Fence
                            Company is ready.
                          </p>
                          <p>
                            You can now review your project online — compare
                            fence options, review included materials and gate
                            configurations, explore available financing, and
                            confirm pricing before approving your agreement.
                          </p>
                        </div>
                        {/* What you can do */}
                        <div
                          className="min-w-full text-[rgba(0,0,0,0.85)]"
                          style={{ fontWeight: 300 }}
                        >
                          <p className="font-semibold text-[16px] leading-[20px] mb-[6px]">
                            What you can do
                          </p>
                          <ul className="text-[12px] leading-[20px] list-disc pl-5">
                            <li>Compare available fence options</li>
                            <li>
                              Review included materials, gate details, and
                              project scope
                            </li>
                            <li>Explore payment and financing options</li>
                            <li>{`Sign your agreement online when you're ready`}</li>
                          </ul>
                        </div>
                        {/* Project info */}
                        <p
                          className="min-w-full whitespace-pre-wrap text-[12px] text-[rgba(0,0,0,0.85)] leading-[20px]"
                          style={{ fontWeight: 300 }}
                        >
                          <span style={{ fontWeight: 600 }}>Project:</span>
                          {` Henderson Backyard Fence Replacement`}
                          <br />
                          <span style={{ fontWeight: 600 }}>Prepared by:</span>
                          {` Leslie Cheung`}
                          <br />
                          <span style={{ fontWeight: 600 }}>
                            Proposal total starting from:
                          </span>
                          {` $8,615.00`}
                        </p>
                        {/* CTA */}
                        <div
                          className="bg-[#d41a32] flex items-center justify-center px-[16px] py-[6px] rounded-[2px] flex-shrink-0"
                          style={{ height: 40 }}
                        >
                          <button
                            onClick={() =>
                              window.open(
                                "/proposal-fence?screen=landing",
                                "_blank",
                              )
                            }
                            className="font-semibold text-[14px] text-white leading-[18px] text-center whitespace-nowrap"
                          >
                            Review My Proposal
                          </button>
                        </div>
                        {/* Sign-off */}
                        <p
                          className="min-w-full text-[12px] text-[rgba(0,0,0,0.85)] leading-[20px]"
                          style={{ fontWeight: 300 }}
                        >
                          If you have any questions, you can contact your sales
                          representative Leslie Cheung directly before making
                          your final decision.
                        </p>
                        <div
                          className="min-w-full text-[12px] text-[rgba(0,0,0,0.85)] leading-[20px]"
                          style={{ fontWeight: 300 }}
                        >
                          <p className="mb-[6px]">Thank you,</p>
                          <p>Madison Fence Company</p>
                        </div>
                      </div>
                      {/* Email footer */}
                      <div
                        className="bg-[#fafafa] flex flex-col gap-[8px] items-start pb-[36px] pt-[24px] px-[54px] text-[rgba(0,0,0,0.55)]"
                        style={{ fontSize: 8 }}
                      >
                        <p
                          className="leading-[12px] w-full"
                          style={{ fontWeight: 400 }}
                        >
                          Madison Fence Company
                          <br />
                          1268 Wilshire Boulevard, Suite 410, Santa Monica, CA
                          90403
                          <br />
                          (310) 555-0126 | hello@oda-architecture.com
                          <br />
                          License #CSLB 1098421
                        </p>
                        <p
                          className="leading-[14px] w-full"
                          style={{ fontWeight: 600 }}
                        >
                          <span className="underline">Legal</span>
                          {` & `}
                          <span className="underline">Privacy Statement</span>
                        </p>
                        <p className="leading-[14px] w-full">
                          This is an operational email. Please do not reply to
                          this email. Replies to this email will not be
                          responded to or read.
                        </p>
                        <p
                          className="leading-[12px] w-full"
                          style={{ letterSpacing: "-0.16px" }}
                        >
                          You are receiving this email because Madison Fence
                          Company has invited you to review your project online.
                          Your digital proposal may include configurable package
                          options, upgrades, add-ons, and estimated pricing.
                          Final contract terms are defined by the signed
                          agreement and may vary based on site conditions,
                          material availability, permitting requirements, and
                          approved project changes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reply / Forward footer */}
                <div className="bg-white flex gap-[6px] items-center flex-shrink-0 pb-[13px] pt-[18px] px-[61px]">
                  <div className="bg-white border border-[#e0e0e0] flex gap-[8px] items-start px-[12px] py-[6px] rounded-[4px]">
                    <OI src="/assets/outlook/reply.svg" w={15.5} h={12.24} />
                    <p className="font-semibold text-[14px] text-[#424242] leading-[20px]">
                      Reply
                    </p>
                  </div>
                  <div className="bg-white border border-[#e0e0e0] flex gap-[8px] items-start px-[12px] py-[6px] rounded-[4px]">
                    <OI
                      src="/assets/outlook/forward-arrow.svg"
                      w={15.5}
                      h={12.24}
                    />
                    <p className="font-semibold text-[14px] text-[#424242] leading-[20px]">
                      Forward
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
