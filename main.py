import argparse
import sys
import json
from pathlib import Path
from rich.console import Console

import studentvibe

console = Console()

def load_config(config_path: str) -> dict:
    try:
        with open(config_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        console.print(f"[bold red]Error:[/] Config file '{config_path}' not found.")
        sys.exit(1)
    except json.JSONDecodeError:
        console.print(f"[bold red]Error:[/] Config file '{config_path}' contains invalid JSON.")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="StudentVibe AI Text Humanizer")
    parser.add_argument("input_file", help="Path to the raw text file to humanize.")
    parser.add_argument(
        "--persona", 
        type=str, 
        choices=["High School", "College", "Creative"],
        default="College",
        help="The persona to use for the humanization process (default: College)."
    )
    parser.add_argument("--config", type=str, default="config.json", help="Path to the persona config file.")
    parser.add_argument("--output", type=str, help="Path to the output Markdown file (optional).")
    
    args = parser.parse_args()

    input_path = Path(args.input_file)
    if not input_path.exists():
        console.print(f"[bold red]Error:[/] Input file '{args.input_file}' not found.")
        sys.exit(1)
        
    config = load_config(args.config)
    
    if args.persona not in config:
        console.print(f"[bold red]Error:[/] Persona '{args.persona}' not found in configuration.")
        sys.exit(1)

    console.print(f"[bold yellow]Loading StudentVibe...[/]")
    console.print(f"[cyan]Target Persona:[/] {args.persona}")
    
    with open(input_path, "r", encoding="utf-8") as f:
        raw_text = f.read()
        
    engine = studentvibe.HumanizerEngine(config[args.persona])
    
    console.print("[yellow]Humanizing text (applying Vocabulary Refactor & Counter-Measures)...[/]")
    processed_text = engine.process(raw_text)
    
    output_path = args.output
    if not output_path:
        output_path = str(input_path.with_suffix(".md").with_name(f"{input_path.stem}_vibe.md"))
        
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(processed_text)
        
    console.print(f"[bold green]Success![/] File saved to: [cyan]{output_path}[/]")

if __name__ == "__main__":
    main()
