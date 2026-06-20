import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import axios from 'axios';

export default function Terminal({ instanceId }) {
    const terminalRef = useRef(null);
    const xtermRef = useRef(null);
    const fitAddonRef = useRef(null);
    const commandBufferRef = useRef('');

    useEffect(() => {
        // Initialize xterm.js
        xtermRef.current = new XTerm({
            cursorBlink: true,
            theme: {
                background: '#000000',
                foreground: '#10b881', // Emerald
                cursor: '#10b881',
                selection: '#10b88144',
            },
            fontSize: 12,
            fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
            convertEol: true,
        });

        fitAddonRef.current = new FitAddon();
        xtermRef.current.loadAddon(fitAddonRef.current);
        xtermRef.current.open(terminalRef.current);
        fitAddonRef.current.fit();

        xtermRef.current.writeln('\x1b[1;32m\u25cf AseroTech Cloud Control Plane \x1b[0m');
        xtermRef.current.writeln('\x1b[1;30mEstablishing secure multiplexer connection...\x1b[0m');
        xtermRef.current.write('\r\n$ ');

        // Setup Echo listener
        if (window.Echo) {
            window.Echo.private(`instance.${instanceId}.terminal`)
                .listen('TerminalOutput', (e) => {
                    // Directly write incoming stream output
                    xtermRef.current.write(e.output);
                });
        }

        // Handle typing
        xtermRef.current.onData(data => {
            if (data === '\r') {
                const cmd = commandBufferRef.current;
                commandBufferRef.current = '';
                xtermRef.current.write('\r\n');
                
                if (cmd.trim() !== '') {
                    axios.post(route('instances.terminal.input', instanceId), {
                        command: cmd
                    }).catch(err => {
                        xtermRef.current.write('\r\n\x1b[1;31mConnection error.\x1b[0m\r\n$ ');
                    });
                } else {
                    xtermRef.current.write('$ ');
                }
            } else if (data === '\x7f') { // Backspace
                if (commandBufferRef.current.length > 0) {
                    commandBufferRef.current = commandBufferRef.current.slice(0, -1);
                    xtermRef.current.write('\b \b');
                }
            } else {
                commandBufferRef.current += data;
                xtermRef.current.write(data);
            }
        });

        const handleResize = () => fitAddonRef.current?.fit();
        window.addEventListener('resize', handleResize);

        return () => {
            if (window.Echo) {
                window.Echo.leave(`instance.${instanceId}.terminal`);
            }
            window.removeEventListener('resize', handleResize);
            xtermRef.current?.dispose();
        };
    }, [instanceId]);

    return (
        <div className="w-full h-full min-h-[300px] md:min-h-[400px] bg-black rounded-3xl p-4 overflow-hidden border border-white/10 shadow-2xl relative group">
            <div ref={terminalRef} className="w-full h-full" />
            <div className="absolute top-4 right-4 flex gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Secure TTY</span>
            </div>
        </div>
    );
}
