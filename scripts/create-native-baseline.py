from pathlib import Path

from bs4 import BeautifulSoup


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "tmp" / "native-baseline-body.html"
TARGET = ROOT / "index.html"


def exact_text(root, value):
    return root.find(string=lambda text: text and text.strip() == value)


fragment = BeautifulSoup(SOURCE.read_text(), "html.parser")

for element in fragment.find_all(True):
    for attribute in list(element.attrs):
        if attribute.startswith("data-dc-"):
            del element.attrs[attribute]

    classes = [name for name in element.get("class", []) if not name.startswith("scp")]
    if classes:
        element["class"] = classes
    elif element.has_attr("class"):
        del element["class"]

for interpolation in fragment.select("span.sc-interp"):
    interpolation.unwrap()

hero = fragment.select_one("#top")
for label, target_id in (
    ("Web enquiries", "hero-web-count"),
    ("Voice assistant enquiries", "hero-voice-count"),
):
    label_node = exact_text(hero, label)
    label_node.parent.parent.find_all("span", recursive=False)[-1]["id"] = target_id

tonight = exact_text(hero, "TONIGHT'S RUN — LIVE").parent
tonight.parent.find_all("div", recursive=False)[-1].find("p")["id"] = "hero-event"

layer_tablist = fragment.find(attrs={"role": "tablist", "aria-label": "The three layers"})
for index, button in enumerate(layer_tablist.find_all("button", recursive=False)):
    button["id"] = f"layer-tab-{index}"
    button["data-action"] = "select-layer"
    button["data-index"] = str(index)
    button["aria-selected"] = "true" if index == 0 else "false"
    button["aria-controls"] = f"layer-panel-{index}"

for index, image_name in enumerate(("website-layer.webp", "voice-layer.webp", "wiring-layer.webp")):
    image = fragment.find("img", src=f"media/{image_name}")
    plane = image.parent
    plane["role"] = "button"
    plane["tabindex"] = "0"
    plane["data-action"] = "select-layer"
    plane["data-index"] = str(index)
    plane["aria-label"] = f"Select layer {index + 1}"
    plane["class"] = ["layer-plane"]

for index, label in enumerate(("Premium websites", "AI web & voice assistance", "Automation & integration")):
    panel = exact_text(fragment, label).parent.parent
    panel["id"] = f"layer-panel-{index}"
    panel["role"] = "tabpanel"
    panel["aria-labelledby"] = f"layer-tab-{index}"
    panel["class"] = ["layer-panel"]

journey_tablist = fragment.find(attrs={"role": "tablist", "aria-label": "Stations of one enquiry"})
for index, button in enumerate(journey_tablist.find_all("button", recursive=False)):
    button["id"] = f"journey-tab-{index}"
    button["data-action"] = "select-station"
    button["data-index"] = str(index)
    button["aria-selected"] = "true" if index == 0 else "false"
    button["aria-controls"] = "journey-panel"

journey_panel = fragment.select_one("#journey [role='tabpanel']")
journey_panel["id"] = "journey-panel"
journey_panel["aria-labelledby"] = "journey-tab-0"

theatre = fragment.select_one("#demos [role='group']")
theatre["id"] = "call-theatre"
start_button = next(button for button in theatre.find_all("button") if "Show me the call" in button.get_text(" ", strip=True))
start_button["data-action"] = "start-call"
theatre_body = start_button.find_parent("div")
theatre_body["id"] = "call-theatre-body"
stop_button = fragment.new_tag("button", type="button", hidden=True)
stop_button["data-action"] = "stop-call"
stop_button.string = "Stop demo"
theatre.append(stop_button)

sector_tablist = fragment.find(attrs={"role": "tablist", "aria-label": "Choose your type of business"})
sector_keys = ("garages", "trades", "dental", "legal")
for key, button in zip(sector_keys, sector_tablist.find_all("button")):
    button["id"] = f"sector-tab-{key}"
    button["data-action"] = "select-sector"
    button["data-sector"] = key
    button["aria-controls"] = "sector-panel"

sector_panel = sector_tablist.find_next(attrs={"role": "tabpanel"})
sector_panel["id"] = "sector-panel"
sector_panel["aria-labelledby"] = "sector-tab-garages"
sector_panel.find("h3")["id"] = "sector-heading"
sector_panel.find("p")["id"] = "sector-scenario"
sector_panel.find("ul")["id"] = "sector-covers"

form = fragment.select_one("#assessment form")
form["id"] = "assessment-form"
form["data-native-form"] = ""

field_messages = {
    "name": "Please tell us your name.",
    "businessName": "Please tell us your business name.",
    "phone": "Please enter a phone number we can reach you on.",
    "email": "That email doesn't look quite right.",
}
for name, message in field_messages.items():
    field = form.find(attrs={"name": name})
    field["required"] = ""
    error = fragment.new_tag("span", id=f"error-{name}", hidden=True)
    error["class"] = ["form-error-message"]
    error.string = message
    field.insert_after(error)

enquiry_select = form.find("select", attrs={"name": "enquiryType"})
enquiry_select["required"] = ""
type_error = fragment.new_tag("span", id="error-enquiryType", hidden=True)
type_error["class"] = ["form-error-message"]
type_error.string = "Choose the option closest to your situation."
enquiry_select.insert_after(type_error)

consent = form.find("input", attrs={"type": "checkbox"})
consent_error = fragment.new_tag("p", id="error-consent", hidden=True)
consent_error["class"] = ["form-error-message"]
consent_error.string = "Please tick the consent box so we're allowed to get back to you."
consent.parent.insert_after(consent_error)

submit_button = next(button for button in form.find_all("button") if "Book my cover assessment" in button.get_text(" ", strip=True))
submit_button["data-action"] = "submit-assessment"

for button in form.find_all("button"):
    text = button.get_text(" ", strip=True)
    if text in {"success", "error"}:
        button["data-action"] = "set-preview"
        button["data-outcome"] = text

feedback = fragment.new_tag("div", id="form-feedback", hidden=True)
feedback["role"] = "status"
feedback["class"] = ["form-feedback"]
feedback.append(BeautifulSoup(
    '<span class="form-feedback-icon" aria-hidden="true">✓</span>'
    '<h3 id="form-feedback-title">Consider it covered.</h3>'
    '<p id="form-feedback-copy">Thanks. We will be in touch within one working day to arrange your cover assessment.</p>'
    '<button type="button" data-action="reset-form">Send another enquiry</button>',
    "html.parser",
))
form.append(feedback)

document = BeautifulSoup("<!doctype html><html lang='en-GB'><head></head><body></body></html>", "html.parser")
head = document.head

head_markup = """
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Work Covered — Websites, AI assistance and automation for UK businesses</title>
<meta name="description" content="Work Covered builds premium websites, intelligent assistants and joined-up systems for owner-led UK businesses — so enquiries stop slipping through and your time comes back.">
<link rel="canonical" href="https://workcovered.com/">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_GB">
<meta property="og:site_name" content="Work Covered">
<meta property="og:title" content="Work Covered — Websites, AI assistance and automation for UK businesses">
<meta property="og:description" content="Premium websites, intelligent assistants and joined-up systems for owner-led UK businesses.">
<meta property="og:url" content="https://workcovered.com/">
<meta name="twitter:card" content="summary">
<meta name="theme-color" content="#0F1A15">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&amp;family=Archivo:wght@400;500;600;700&amp;family=IBM+Plex+Mono:wght@400;500&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/site.css">
<script type="module" src="assets/js/site.js"></script>
"""
for node in list(BeautifulSoup(head_markup, "html.parser").contents):
    head.append(node)

document.body["class"] = ["native-site"]
main = document.new_tag("main")
for node in list(fragment.contents):
    if not getattr(node, "name", None):
        continue
    if node.name == "header":
        document.body.append(node)
    elif node.name == "footer":
        document.body.append(main)
        document.body.append(node)
    else:
        main.append(node)

TARGET.write_text(document.prettify(formatter="html"))
