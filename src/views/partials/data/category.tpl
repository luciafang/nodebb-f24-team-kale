<tr data-tid="{tid}" data-index="{index}" data-cid="{cid}" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
    
    <td class="text-center">
        <!-- Resolved/Not Resolved Display -->
        {{{ if topics.resolved }}}
            <span class="badge badge-success">
                <i class="fa fa-check-circle"></i> Resolved
            </span>
        {{{ else }}}
            <span class="badge badge-secondary">
                <i class="fa fa-times-circle"></i> Not Resolved
            </span>
        {{{ end }}}

    </td>

</tr>
