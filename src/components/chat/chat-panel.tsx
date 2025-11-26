'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { Image as ImageIcon, FilePlus, FileText, X, SendHorizontal } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Chat, SuggestedQuestion } from '@/lib/types';
import { cn } from '@/lib/utils';

// Constantes de estilo
const palette = {
  bg1: '#031718',
  bg2: '#0B2A2B',
  surface: 'rgba(3, 23, 24, 0.85)',
  border: 'rgba(210, 242, 82, 0.15)',
  accent: '#D2F252',
  text: '#E9FFD0',
  textMuted: '#bfe6a8',
  ink: '#082323',
  danger: '#ff6b6b',
};

const TYPING_STEP = 2;
const TYPING_INTERVAL = 35;

interface ChatPanelProps {
  chat?: Chat;
  onSendMessage: (content: string, file?: File) => void;
  onSendSuggestedQuestion: (question: SuggestedQuestion) => void;
  suggestedQuestions: SuggestedQuestion[];
  className?: string;
  disabled?: boolean;
}

const isImageMime = (value: string) =>
  typeof value === "string" && value.toLowerCase().startsWith("image/");

export default function ChatPanel({
  chat,
  onSendMessage,
  className,
  disabled,
}: ChatPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [inputContainerHeight, setInputContainerHeight] = useState(0);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<any[]>([]);
  const [filePreviews, setFilePreviews] = useState<any[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const plusMenuWrapperRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fade dinámico
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);

  // Sincronizar mensajes del chat prop con el estado local si fuera necesario,
  // pero usaremos chat.messages directamente para renderizar.
  const messages = chat?.messages || [];

  useEffect(() => {
    const handleResize = () => {
      if (inputContainerRef.current) {
        setInputContainerHeight(inputContainerRef.current.offsetHeight);
      }
    };

    handleResize();

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }

    return undefined;
  }, []);

  const updateScrollFades = () => {
    const el = scrollAreaRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;

    // Si no hay overflow, ocultamos difuminados
    if (scrollHeight <= clientHeight + 1) {
      if (showTopFade) setShowTopFade(false);
      if (showBottomFade) setShowBottomFade(false);
      return;
    }

    const nextShowTop = scrollTop > 4;
    const nextShowBottom = scrollTop + clientHeight < scrollHeight - 4;

    if (nextShowTop !== showTopFade) setShowTopFade(nextShowTop);
    if (nextShowBottom !== showBottomFade) setShowBottomFade(nextShowBottom);
  };

  useEffect(() => {
    return () => {
      // Limpia URLs creadas para imágenes cuando se desmontan o cambian
      imagePreviews.forEach((item) => {
        if (item?.url) {
          URL.revokeObjectURL(item.url);
        }
      });
    };
  }, [imagePreviews]);

  useEffect(() => {
    if (!isPlusMenuOpen) return undefined;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        plusMenuWrapperRef.current &&
        !plusMenuWrapperRef.current.contains(event.target as Node)
      ) {
        setIsPlusMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPlusMenuOpen]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    updateScrollFades();
  }, [messages]);

  // Detectar cuando el bot está respondiendo para mostrar estado "thinking"
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'bot' && lastMessage.isLoading) {
      setIsThinking(true);
    } else {
      setIsThinking(false);
    }
  }, [messages]);

  const handleSubmit = () => {
    const trimmed = inputValue.trim();

    if ((!trimmed && imagePreviews.length === 0 && filePreviews.length === 0) || isThinking || disabled) return;

    // Preparar archivo para enviar si hay uno seleccionado
    // Nota: La interfaz actual de onSendMessage solo acepta un archivo
    // Priorizamos imágenes sobre archivos si hay ambos, o el primero de la lista
    let fileToSend: File | undefined = undefined;

    if (imagePreviews.length > 0) {
      fileToSend = imagePreviews[0].file;
    } else if (filePreviews.length > 0) {
      fileToSend = filePreviews[0].file;
    }

    onSendMessage(trimmed, fileToSend);

    setInputValue("");
    clearAttachments();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handleAddImages = () => {
    setIsPlusMenuOpen(false);
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  const handleAddFiles = () => {
    setIsPlusMenuOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImagesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files || files.length === 0) return;
    const allowed = Array.from(files).filter((file) => {
      const name = file.name?.toLowerCase() || "";
      return file.type === "image/jpeg" || name.endsWith(".jpg") || name.endsWith(".jpeg") || file.type === "image/png" || name.endsWith(".png");
    });
    if (allowed.length === 0) {
      event.target.value = "";
      return;
    }
    const mapped = allowed.map((file, index) => ({
      id: `${file.name}-${Date.now()}-${index}`,
      name: file.name,
      url: URL.createObjectURL(file),
      file,
    }));
    setImagePreviews((prev) => [...prev, ...mapped]);
    // Clear to allow re-selecting the same file later
    event.target.value = "";
  };

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files || files.length === 0) return;
    const mapped = Array.from(files).map((file, index) => ({
      id: `${file.name}-${Date.now()}-${index}`,
      name: file.name,
      file,
    }));
    setFilePreviews((prev) => [...prev, ...mapped]);
    event.target.value = "";
  };

  const handleRemoveImage = (id: string) => {
    setImagePreviews((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.url) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleRemoveFile = (id: string) => {
    setFilePreviews((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAttachments = () => {
    setImagePreviews((prev) => {
      prev.forEach((item) => {
        if (item?.url) {
          URL.revokeObjectURL(item.url);
        }
      });
      return [];
    });
    setFilePreviews([]);
  };

  const hasMessages = messages.length > 0;
  const inputOverlapOffset = hasMessages
    ? Math.max(inputContainerHeight - 24, 120)
    : 0;
  const chatBottomPadding = hasMessages
    ? inputOverlapOffset + 32
    : 72;
  const inputContainerMargin = hasMessages
    ? `-${inputOverlapOffset}px auto 0`
    : "0 auto";

  const quickPrompts = [
    {
      title: "El modelo sigue aprendiendo",
      detail: "Todavía puede equivocarse o no entender del todo el contexto. Tu uso nos ayuda a mejorarlo.",
    },
    {
      title: "Ayúdanos a mejorar",
      detail: "Si ves una respuesta confusa o incorrecta, no olvides reportárnoslo o dejarnos tus comentarios.",
    },
    {
      title: "Entre más contexto, mejor",
      detail: "Agrega ejemplos, datos y lo que quieres lograr para que las respuestas sean más útiles y precisas.",
    }
  ];

  const handleScroll = () => {
    updateScrollFades();
  };

  return (
    <div
      className={cn("chat-panel-container", className)}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 32,
        padding: "32px clamp(24px, 5vw, 80px) 48px",
        height: "100%",
        minHeight: 0,
        flex: 1,
        boxSizing: "border-box",
        background:
          "radial-gradient(1200px 800px at 20% -120%, rgba(210,242,82,0.18), transparent 65%), linear-gradient(180deg, rgba(3,23,24,0.85) 0%, rgba(3,23,24,0.65) 100%)",
        borderTop: `1px solid ${palette.border}`,
        borderLeft: `1px solid ${palette.border}`,
        color: palette.text,
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 80% 120%, rgba(210,242,82,0.15), transparent 45%)",
          pointerEvents: "none",
          mixBlendMode: "screen",
        }}
      />

      <main
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: hasMessages ? "stretch" : "center",
          justifyContent: hasMessages ? "flex-start" : "center",
          gap: hasMessages ? 24 : 40,
          textAlign: hasMessages ? "left" : "center",
          padding: "0 12px",
        }}
      >
        {hasMessages ? (
          <div
            style={{
              width: "100%",
              maxWidth: 900,
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: 24,
              padding: "12px 8px 0",
              overflow: "hidden",
              flex: 1,
              minHeight: 0,
            }}
          >
            <div
              className="chat-scroll-wrapper"
              style={{
                position: "relative",
                paddingRight: 8,
                display: "flex",
                flexDirection: "column",
                flex: 1,
                minHeight: 0,
              }}
            >
              <div
                ref={scrollAreaRef}
                className="chat-scroll-area"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
                  paddingRight: 48,
                  paddingLeft: 48,
                  paddingTop: 4,
                  paddingBottom: chatBottomPadding,
                }}
                onScroll={handleScroll}
              >
                {messages.map((msg) => {
                  const isUser = msg.role === "user";
                  const bubbleColor = isUser
                    ? "rgba(210,242,82,0.15)"
                    : "rgba(255,255,255,0.05)";
                  const borderColor = isUser
                    ? "rgba(210,242,82,0.35)"
                    : palette.border;

                  // Adaptar estado de carga del mensaje
                  const isLoading = msg.isLoading;
                  const label = isLoading ? "Pensando..." : "";
                  const shouldShowLabel = Boolean(label);

                  // Adaptar adjuntos
                  const attachment = msg.attachment;
                  const attachments = attachment ? [attachment] : [];
                  const hasAttachments = attachments.length > 0;

                  const rawContent = typeof msg.content === "string" ? msg.content : "";
                  const hasText = Boolean(rawContent.trim());
                  const placeholderText = !hasText && !hasAttachments && isLoading ? "…" : "";
                  const textToRender = hasText ? rawContent : placeholderText;
                  const shouldRenderText = Boolean(textToRender);

                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        alignItems: isUser ? "flex-end" : "flex-start",
                      }}
                    >
                      {shouldShowLabel && (
                        <span
                          style={{
                            fontSize: 12,
                            letterSpacing: 0.4,
                            color: "rgba(233,255,208,0.65)",
                          }}
                        >
                          {label}
                        </span>
                      )}
                      <div
                        style={{
                          maxWidth: "85%",
                          padding: "16px 18px",
                          borderRadius: 18,
                          background: bubbleColor,
                          border: `1px solid ${borderColor}`,
                          lineHeight: 1.6,
                          fontSize: 14,
                          color: "rgba(233,255,208,0.92)",
                          boxShadow: "0 18px 40px rgba(0,0,0,0.32)",
                          backdropFilter: "blur(3px)",
                          WebkitBackdropFilter: "blur(3px)",
                        }}
                      >
                        {shouldRenderText &&
                          (isUser ? (
                            <span style={{ whiteSpace: "pre-wrap" }}>
                              {textToRender}
                            </span>
                          ) : (
                            <div className="chat-markdown prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/30 prose-pre:border prose-pre:border-white/10 text-[14px] prose-p:text-[14px] text-[rgba(233,255,208,0.92)] prose-p:text-[rgba(233,255,208,0.92)] prose-headings:text-[rgba(233,255,208,0.92)] prose-strong:text-[rgba(233,255,208,0.92)]">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {textToRender}
                              </ReactMarkdown>
                            </div>
                          ))}
                        {hasAttachments && (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 12,
                              marginTop: shouldRenderText ? 12 : 0,
                            }}
                          >
                            {attachments.map((att, attachmentIndex) => {
                              const hasUrl = Boolean(att?.url);
                              const attachmentId = `${msg.id}-attachment-${attachmentIndex}`;
                              const name = att?.name || (isImageMime(att?.contentType || '') ? "Imagen adjunta" : "Archivo adjunto");

                              const renderAsImage = (isImageMime(att?.contentType || '') || att?.contentType?.startsWith('image/')) && hasUrl;
                              const cardBorder = `1px solid ${borderColor}`;
                              const commonShadow = "0 10px 25px rgba(0,0,0,0.28)";

                              if (renderAsImage) {
                                const imageContent = (
                                  <div
                                    style={{
                                      position: "relative",
                                      width: 160,
                                      height: 160,
                                      borderRadius: 14,
                                      overflow: "hidden",
                                      border: cardBorder,
                                      background: "rgba(255,255,255,0.04)",
                                      boxShadow: commonShadow,
                                    }}
                                  >
                                    <img
                                      src={att.url}
                                      alt="Imagen adjunta"
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        display: "block",
                                      }}
                                    />
                                  </div>
                                );
                                return hasUrl ? (
                                  <a
                                    key={attachmentId}
                                    href={att.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ textDecoration: "none" }}
                                  >
                                    {imageContent}
                                  </a>
                                ) : (
                                  <div key={attachmentId}>{imageContent}</div>
                                );
                              }

                              const fileCard = (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    padding: "10px 12px",
                                    borderRadius: 12,
                                    border: cardBorder,
                                    background: "rgba(255,255,255,0.04)",
                                    color: palette.text,
                                    boxShadow: commonShadow,
                                    minWidth: 180,
                                    maxWidth: 280,
                                  }}
                                >
                                  <FileText
                                    aria-hidden="true"
                                    style={{ fontSize: 18 }}
                                  />
                                  <div
                                    style={{
                                      flex: 1,
                                      fontSize: 13,
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                    title={name}
                                  >
                                    {name}
                                  </div>
                                  {hasUrl && (
                                    <span
                                      style={{
                                        fontSize: 12,
                                        color: "rgba(233,255,208,0.85)",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      Abrir
                                    </span>
                                  )}
                                </div>
                              );
                              return hasUrl ? (
                                <a
                                  key={attachmentId}
                                  href={att.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ textDecoration: "none" }}
                                >
                                  {fileCard}
                                </a>
                              ) : (
                                <div key={attachmentId}>{fileCard}</div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {showTopFade && (
                <div className="chat-scroll-fade chat-scroll-fade--top"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 8,
                    height: 40,
                    background: 'linear-gradient(to bottom, rgba(3,23,24,0.95), transparent)',
                    pointerEvents: 'none',
                    zIndex: 2
                  }}
                />
              )}
              {showBottomFade && (
                <div className="chat-scroll-fade chat-scroll-fade--bottom"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 8,
                    height: 40,
                    background: 'linear-gradient(to top, rgba(3,23,24,0.95), transparent)',
                    pointerEvents: 'none',
                    zIndex: 2
                  }}
                />
              )}
            </div>
          </div>
        ) : (
          <>
            <div>
              <p
                style={{
                  fontSize: "clamp(22px, 4vw, 36px)",
                  fontWeight: 700,
                  marginBottom: 12,
                }}
              >
                ¿En qué puedo ayudar, MentalBeat?
              </p>
              <p
                style={{
                  fontSize: 14,
                  color: "rgba(233,255,208,0.7)",
                  maxWidth: 620,
                  margin: "0 auto",
                  lineHeight: 1.2,
                }}
              >
                Cuéntame qué necesitas y te ayudo al instante:<br />ideas, textos,
                resúmenes y respuestas claras a tus dudas.
              </p>
            </div>

            <div
              style={{
                width: "100%",
                maxWidth: 900,
                display: "grid",
                gap: 16,
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              }}
            >
              {quickPrompts.map((item) => (
                <div
                  key={item.title}
                  style={{
                    padding: "20px 18px",
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.05)",
                    border: `1px solid ${palette.border}`,
                    textAlign: "left",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    boxShadow: "0 15px 40px rgba(0,0,0,0.25)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: 1.2,
                      color: "rgba(233,255,208,0.75)",
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      lineHeight: 1.5,
                      color: "rgba(233,255,208,0.85)",
                    }}
                  >
                    {item.detail}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <div
        ref={inputContainerRef}
        style={{
          position: "relative",
          zIndex: 5,
          width: "100%",
          maxWidth: 880,
          margin: inputContainerMargin,
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {(imagePreviews.length > 0 || filePreviews.length > 0) && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              marginBottom: 12,
            }}
          >
            {imagePreviews.map((item) => (
              <div
                key={item.id}
                style={{
                  position: "relative",
                  width: 86,
                  height: 86,
                  borderRadius: 14,
                  overflow: "hidden",
                  border: `1px solid ${palette.border}`,
                  background: "rgba(255,255,255,0.04)",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.28)",
                }}
              >
                <img
                  src={item.url}
                  alt={item.name || "imagen seleccionada"}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(item.id)}
                  aria-label="Eliminar imagen"
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 24,
                    height: 24,
                    minWidth: 24,
                    minHeight: 24,
                    aspectRatio: "1 / 1",
                    borderRadius: "50%",
                    border: `1px solid ${palette.border}`,
                    background: "rgba(3,23,24,0.92)",
                    color: palette.text,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    appearance: "none",
                    WebkitAppearance: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.35)",
                    lineHeight: 1,
                  }}
                >
                  <X aria-hidden="true" style={{ fontSize: 13, strokeWidth: 3 }} />
                </button>
              </div>
            ))}
            {filePreviews.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: `1px solid ${palette.border}`,
                  background: "rgba(255,255,255,0.04)",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.28)",
                  color: palette.text,
                  maxWidth: 240,
                }}
              >
                <FileText aria-hidden="true" style={{ fontSize: 18 }} />
                <div
                  style={{
                    flex: 1,
                    fontSize: 13,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={item.name}
                >
                  {item.name || "Archivo PDF"}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(item.id)}
                  aria-label="Eliminar archivo"
                  style={{
                    width: 24,
                    height: 24,
                    minWidth: 24,
                    minHeight: 24,
                    aspectRatio: "1 / 1",
                    borderRadius: "50%",
                    border: `1px solid ${palette.border}`,
                    background: "rgba(3,23,24,0.92)",
                    color: palette.text,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    appearance: "none",
                    WebkitAppearance: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.35)",
                    flexShrink: 0,
                    lineHeight: 1,
                  }}
                >
                  <X aria-hidden="true" style={{ fontSize: 13, strokeWidth: 3 }} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div
          style={{
            borderRadius: 28,
            border: `1px solid ${palette.border}`,
            background: palette.bg2 || "#0B2A2B",
            boxShadow:
              "0 15px 35px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)",
            padding: "18px 22px",
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            ref={plusMenuWrapperRef}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <input
              type="file"
              ref={imageInputRef}
              accept="image/jpeg,image/png"
              multiple
              onChange={handleImagesSelected}
              style={{ display: "none" }}
            />
            <input
              type="file"
              ref={fileInputRef}
              accept="application/pdf"
              multiple
              onChange={handleFilesSelected}
              style={{ display: "none" }}
            />
            <button
              type="button"
              aria-label="abrir opciones"
              onClick={() => setIsPlusMenuOpen((value) => !value)}
              disabled={isThinking || disabled}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                border: "none",
                aspectRatio: "1 / 1",
                padding: 0,
                background: palette.accent,
                color: palette.ink,
                fontWeight: 700,
                fontSize: 20,
                lineHeight: 1,
                cursor: isThinking || disabled ? "not-allowed" : "pointer",
                opacity: isThinking || disabled ? 0.5 : 1,
                boxShadow: "0 10px 25px rgba(210,242,82,0.35)",
                transition: "opacity 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              +
            </button>
            {isPlusMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: "calc(100% + 10px)",
                  minWidth: 200,
                  padding: 8,
                  borderRadius: 12,
                  background: palette.surface || "rgba(3,23,24,0.85)",
                  border: `1px solid ${palette.border}`,
                  boxShadow: "0 16px 30px rgba(0,0,0,0.35)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  zIndex: 5,
                }}
              >
                <button
                  type="button"
                  onClick={handleAddImages}
                  style={{
                    width: "100%",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 12px",
                    background: "transparent",
                    color: palette.text,
                    fontSize: 13,
                    fontWeight: 600,
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "background 0.2s ease, color 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    whiteSpace: "nowrap",
                  }}
                >
                  <ImageIcon
                    aria-hidden="true"
                    style={{ fontSize: 16, color: palette.text }}
                  />
                  Añadir imágenes
                </button>
                <button
                  type="button"
                  onClick={handleAddFiles}
                  style={{
                    width: "100%",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 12px",
                    background: "transparent",
                    color: palette.text,
                    fontSize: 13,
                    fontWeight: 600,
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "background 0.2s ease, color 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    whiteSpace: "nowrap",
                  }}
                >
                  <FilePlus
                    aria-hidden="true"
                    style={{ fontSize: 16, color: palette.text }}
                  />
                  Añadir archivos
                </button>
              </div>
            )}
          </div>
          <textarea
            className="chat-input placeholder:text-[var(--chat-placeholder-color)]"
            placeholder="Pregunta lo que quieras"
            style={{
              "--chat-placeholder-color": "rgba(210, 242, 82, 0.4)",
              flex: 1,
              background: "transparent",
              border: "none",
              resize: "none",
              color: palette.text,
              fontSize: 15,
              lineHeight: 1.4,
              fontFamily: "inherit",
              outline: "none",
            } as React.CSSProperties}
            rows={1}
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
          />
          <button
            type="button"
            aria-label="enviar prompt"
            onClick={handleSubmit}
            disabled={(!inputValue.trim() && imagePreviews.length === 0 && filePreviews.length === 0) || isThinking || disabled}
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "none",
              aspectRatio: "1 / 1",
              padding: 0,
              background: palette.accent,
              color: palette.ink,
              fontWeight: 700,
              fontSize: 14,
              cursor:
                (!inputValue.trim() && imagePreviews.length === 0 && filePreviews.length === 0) || isThinking || disabled ? "not-allowed" : "pointer",
              opacity: (!inputValue.trim() && imagePreviews.length === 0 && filePreviews.length === 0) || isThinking || disabled ? 0.5 : 1,
              boxShadow: "0 10px 25px rgba(210,242,82,0.35)",
              transition: "opacity 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SendHorizontal size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
