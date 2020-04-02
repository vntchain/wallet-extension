const laws = {
  zh: [
    {
      title: 'VNT钱包 服务条款',
      cont: '最后修改日期： 2019年6月1日'
    },
    {
      title: '欢迎使用 VNT钱包！',
      cont:
        '感谢您使用我们的产品和服务（下称“服务”）。服务由©VNT Chain提供。\n' +
        '您使用我们的服务即表示您已同意本条款。请仔细阅读。\n' +
        '我们的服务范围非常广泛，因此有时还会适用一些附加条款或产品要求（包括年龄要求）。附加条款将会与相关服务一同提供，并且在您使用这些服务后，成为您与我们所达成的协议的一部分。\n'
    },
    {
      title: '使用服务',
      cont:
        '您必须遵守服务中提供的所有政策。\n' +
        '请勿滥用我们的服务。举例而言，请勿干扰我们的服务或尝试使用除我们提供的界面和指示以外的方法访问这些服务。您仅能在法律（包括适用的出口和再出口管制法律和法规）允许的范围内使用我们的服务。如果您不遵守我们的条款或政策，或者我们在调查可疑的不当行为，我们可以暂停或停止向您提供服务。\n' +
        '使用我们的服务并不让您拥有我们的服务或您所访问的内容的任何知识产权。除非您获得相关内容所有者的许可或通过其他方式获得法律的许可，否则您不得使用服务中的任何内容。本条款并未授予您使用我们服务中所用的任何商标或标志的权利。请勿删除、隐藏或更改我们服务上显示的或随服务一同显示的任何法律声明。\n' +
        '我们的服务会显示一些不属于 VNT钱包 的内容。这些内容由发布的实体承担全部责任。我们可能会审查相关内容，以确定其是否违法或违反了我们的政策；如果我们有理由相信该内容违反了我们的政策或违法，我们可以将其删除或拒绝显示。不过，这并不意味我们必然会审查内容，因此请勿想当然地认为我们在进行审查。\n' +
        '在您使用服务的过程中，我们可能会向您发送服务公告、管理消息和其他信息。您可以选择不接收上述某些信息。\n' +
        '我们的部分服务可在移动设备上使用。在使用此类服务时，请勿因此而分散注意力和违反交通或安全法。\n'
    },
    {
      title: 'VNT钱包帐户',
      cont:
        '为了使用我们的某些服务，您可能需要一个 VNT钱包帐户。您可以创建自己的 VNT钱包帐户或者由管理员（例如您所在的单位或教育机构）为您分配 VNT钱包帐户。如果您使用的是由管理员分配的 VNT钱包帐户，可能需要遵守另外的条款或附加条款，并且您的管理员可能有权访问或停用您的帐户。\n' +
        '为保护您的 VNT钱包帐户，请务必保管好您的密码并对外保密。您应对自己 VNT钱包帐户上发生的活动或通过该帐户进行的活动负责。尽量不要在第三方应用中使用与 VNT钱包帐户相同的密码。如果您发现有人在未经授权的情况下使用了您的密码或 VNT钱包 帐户，请及时联系我们。\n'
    },
    {
      title: '隐私与版权保护',
      cont:
        '您使用我们的服务时，我们会处理您的个人数据和保护您的隐私。使用我们的服务即表示您同意 VNT钱包 可以使用您的个人数据。\n' +
        '我们会根据相关规定的流程，对涉嫌侵犯版权的通知作出回应并终止屡次侵权人的帐户。\n' +
        '我们会向版权持有人提供信息，以帮助他们在线管理自己的知识产权。\n'
    },
    {
      title: '您在我们服务中发布的内容',
      cont:
        '我们的某些服务允许您上传、提交、存储、发送或接收内容。您保留对该内容持有的任何知识产权的所有权。简言之，属于您的内容依然归您所有。\n' +
        '当您将内容上传、提交、存储或发送到我们的服务，以及通过我们的服务上传、提交、存储、发送或接收内容时，您授予VNT钱包（以及我们的合作伙伴）一项全球性的许可，允许VNT钱包使用、托管、存储、复制、修改、创建衍生作品（例如，我们为了使您的内容更好地与我们的服务配合使用而进行翻译、改编或其他更改，由此产生的作品）、传播、出版、公开演示、公开展示和分发此类内容。您在此许可中授予的权限，仅能用于运营、宣传和改进我们的服务，以及开发新的服务。该项许可在您停止使用我们的服务后依然有效。某些服务可能会向您提供一些方法，用于访问和删除您提供给该服务的内容。此外，我们某些服务中的条款或设置还会收窄我们对提交至相关服务的内容的使用范围。对于您提交至我们服务的任何内容，请确保您拥有向我们授予此许可的必要权利。\n' +
        '我们的自动化系统会对您的内容进行分析，以便为您提供更符合个人需求的产品功能，例如自定义搜索结果、量身定制的广告，以及垃圾邮件和恶意软件检测。当您发送、接收以及存储内容时，我们的系统就会进行这项分析。\n' +
        '如果您已拥有 VNT钱包帐户，我们可能会在我们的服务（包括广告以及其他商业环境）中，显示您的个人资料姓名、个人资料照片以及您在VNT钱包上或与VNT钱包帐户相关联的第三方应用上执行的操作。\n' +
        '您可以在相关服务的隐私权政策或附加条款中找到关于VNT钱包 如何使用和储存内容的详情。如果您提交关于我们的服务的反馈或建议，我们可能会加以利用，但不对您承担任何义务。\n'
    },
    {
      title: '关于我们服务中的软件',
      cont:
        '如果某项服务要求下载或包含可下载软件，该软件可能会在新版本或新功能推出时，在您的设备上自动更新。某些服务可能会允许您自行调整自动更新设置。\n' +
        'VNT钱包 授予您免许可使用费的、不可转让的、非独占的全球性个人许可，允许您使用由 VNT钱包 提供的、包含在服务中的软件。本许可仅旨在让您通过本条款允许的方式使用由 VNT钱包 提供的服务并从中受益。您不得复制、修改、发布、出售或出租我们的服务或所含软件的任何部分，也不得进行反向工程或试图提取该软件的源代码，除非法律禁止上述限制或您已获得 VNT钱包 的书面许可。\n' +
        '开源软件对我们很重要。我们的服务中所使用的部分软件可能是根据开放源代码许可提供的，我们将会向您提供该许可。开放源代码许可中的规定可能会明确推翻上述某些条款。\n'
    },
    {
      title: '修改和终止服务',
      cont:
        '我们始终在不断更改和改进我们的服务。我们可能会增加或删除功能，也可能暂停或彻底停止某项服务。\n' +
        '您可以随时停止使用我们的服务，尽管我们对此表示非常遗憾。VNT钱包 也可能随时停止向您提供服务，或随时对我们的服务增加或设置新的限制。\n' +
        '我们认为您拥有自己数据的所有权并保留对此类数据的访问权限，这一点非常重要。如果我们停止某项服务，在合理可能的情况下，我们会向用户发出合理的提前通知，并让用户有机会将信息从服务中汇出。\n'
    },
    {
      title: '保证和免责声明',
      cont:
        '我们在提供服务时将会尽到商业上合理水平的技能和注意义务，希望您会喜欢使用它们。但有些关于服务的事项恕我们无法作出承诺。\n' +
        '除本条款或附加条款中明确规定的内容外，VNT钱包 及其供应商和分销商对服务均不作任何具体承诺。例如，我们对服务内容、服务的具体功能，或其可靠性、可用性或满足您需要的能力不作任何承诺。服务是“按原样”提供的。\n' +
        '某些司法管辖区域会规定特定保证，例如适销性、特定目的适用性及不侵权的默示保证。在法律允许的范围内，我们排除所有保证。\n'
    },
    {
      title: '服务的责任',
      cont:
        '在法律允许的范围内，VNT钱包 及其供应商和分销商不承担利润损失、收入损失或数据、财务损失或间接、特殊、后果性、惩戒性或惩罚性损害赔偿的责任。\n' +
        '在法律允许的范围内，VNT钱包 及其供应商和分销商对于本条款项下任何索赔（包括任何默示保证）的全部赔偿责任限于您因使用服务而向我们支付的金额（或我们亦可选择，再次向您提供该服务）。\n' +
        '在所有情况下，VNT钱包 及其供应商和分销商对于任何不能合理预见的损失或损害不承担责任。\n' +
        '我们理解在一些国家/地区，您作为消费者可以享有某些法定权利。如果您出于个人目的而使用服务，对于任何不能通过合同放弃的消费者法定权利，本条款或附加条款不作限制。\n'
    },
    {
      title: '服务的商业使用',
      cont:
        '如果您代表某家企业使用我们的服务，该企业必须接受本条款。对于因使用本服务或违反本条款而导致的或与之相关的任何索赔、起诉或诉讼，包括因索赔、损失、损害赔偿、起诉、判决、诉讼费和律师费而产生的任何责任或费用，该企业应对 VNT钱包 及其关联机构、管理人员、代理机构和员工进行赔偿并使之免受损害。'
    },
    {
      title: '关于本条款',
      cont:
        '我们可以修改上述条款或任何适用于某项服务的附加条款，例如，为反映法律的变更或我们服务的变化而进行的修改。您应当定期查阅本条款。我们会在本网页上公布这些条款的修改通知。我们会在适用的服务中公布附加条款的修改通知。所有修改的适用不具有追溯力，且会在公布十四天或更长时间后方始生效。但是，对服务新功能的特别修改或由于法律原因所作的修改将立即生效。如果您不同意服务的修改条款，应停止使用服务。\n' +
        '如果本条款与附加条款有冲突，以附加条款为准。\n' +
        '本条款约束 VNT钱包 与您之间的关系，且不创设任何第三方受益权。\n' +
        '如果您不遵守本条款，且我们未立即采取行动，并不意味我们放弃我们可能享有的任何权利（例如，在将来采取行动）。\n' +
        '如果某一条款不能被强制执行，这不会影响其他条款的效力。\n' +
        '有关如何与 VNT钱包 联系的信息，请查看服务中的“关于我们”。\n'
    }
  ],
  en: [
    {
      title: 'VNT Wallet Terms of Service',
      cont: 'Last modified: June 1, 2019'
    },
    {
      title: 'Welcome to VNT Wallet! ',
      cont:
        'Thank you for using our products and services ("Services"). Services are provided by © VNT Chain.\n' +
        'By using our services, you agree to these terms. Please read carefully. \n ' +
        'Our services are very extensive, so sometimes additional terms or product requirements (including age requirements) apply. Additional terms will be provided with related services and become part of your agreement with us after you use these services. \n '
    },
    {
      title: 'Use the service',
      cont:
        'You must comply with all policies provided in the service. \n ' +
        "Do not abuse our services. For example, don't interfere with our services or try to access them using methods other than the interface and instructions we provide. You may only use our services to the extent permitted by law, including applicable export and re-export control laws and regulations. If you do not comply with our terms or policies, or if we are investigating suspected misconduct, we may suspend or stop providing services to you. \n " +
        'Using our services does not give you any intellectual property rights in our services or the content you access. You may not use any content in the Services unless you have obtained permission from the relevant content owner or otherwise obtain legal permission. These terms do not grant you the right to use any trademarks or logos used in our services. Do not delete, hide, or change any legal notices displayed on or with our services. \n ' +
        'Our service will display some content that is not part of the VNT wallet. This content is the sole responsibility of the publishing entity. We may review the content to determine whether it violates our policies or violates our policies; if we have reason to believe that the content violates our policies or violates our laws, we can remove or refuse to display it. However, this does not mean that we are necessarily reviewing the content, so do n’t take it for granted that we are reviewing. \n ' +
        'As you use the service, we may send you service announcements, administrative messages, and other information. You can choose not to receive some of the above information. \n ' +
        'Some of our services are available on mobile devices. When using such services, do not distract and violate traffic or safety laws as a result. \n '
    },
    {
      title: 'VNT Wallet Account',
      cont:
        'In order to use some of our services, you may need a VNT wallet account. You can create your own VNT wallet account or have an administrator (such as your organization or educational institution) assign you a VNT wallet account. If you are using a VNT wallet account assigned by an administrator, additional or additional terms may be required, and your administrator may have access to or disable your account. \n ' +
        'To protect your VNT wallet account, please be sure to keep your password and keep it confidential. You are responsible for activities that occur on or through your VNT wallet account. Try not to use the same password as your VNT wallet account in third-party applications. If you find that someone has used your password or VNT wallet account without authorization, please contact us in time. \n '
    },
    {
      title: 'Privacy and Copyright Protection',
      cont:
        'When you use our services, we process your personal data and protect your privacy. By using our services, you agree that VNT Wallet can use your personal data. \n ' +
        'We will respond to notices of alleged copyright infringement and terminate accounts of repeat infringers in accordance with the required procedures. \n ' +
        'We provide information to copyright holders to help them manage their intellectual property online. \n '
    },
    {
      title: 'What you post on our service',
      cont:
        'Some of our services allow you to upload, submit, store, send or receive content. You retain ownership of any intellectual property rights in the content. In short, your content remains yours. \n ' +
        'When you upload, submit, store, or send content to our services, and upload, submit, store, send, or receive content through our services, you grant VNT Wallet (and our partners) a global Licenses that allow VNT wallets to use, host, store, copy, modify, create derivative works (for example, works that we translate, adapt or otherwise change in order to make your content work better with our services, ), Disseminate, publish, publicly demonstrate, publicly display, and distribute such content. The permissions you grant in this license can only be used to operate, promote and improve our services and develop new services. This license is valid even after you stop using our services. Some services may provide you with methods to access and remove content you provide to the service. In addition, terms or settings in some of our services may narrow our use of content submitted to related services. For any content you submit to our service, please ensure that you have the necessary rights to grant us this license. \n ' +
        'Our automated systems analyze your content to provide you with product features that are more personal, such as custom search results, tailored advertising, and spam and malware detection. This analysis is performed by our system when you send, receive, and store content. \n ' +
        'If you already have a VNT Wallet Account, we may display your profile name, profile picture, and your VNT Wallet or associated VNT Wallet account in our services, including advertising Actions performed on third-party applications. \n ' +
        'You can find details on how VNT Wallet uses and stores content in the privacy policy or additional terms of the service. If you submit feedback or suggestions about our services, we may take advantage of them without incurring any obligation to you. \n '
    },
    {
      title: 'About the software in our service',
      cont:
        'If a service requires downloading or contains downloadable software, the software may be automatically updated on your device when a new version or feature is introduced. Some services may allow you to adjust your automatic update settings yourself. \n ' +
        'VNT Wallet grants you a royalty-free, non-transferable, non-exclusive global personal license that allows you to use the software provided by VNT Wallet and included in the service. This license is only intended to allow you to use and benefit from the services provided by VNT Wallet in the manner permitted by these Terms. You may not copy, modify, publish, sell, or rent any part of our service or the included software, nor reverse engineer or attempt to extract the source code of the software, unless the above restrictions are prohibited by law or you have obtained a written copy of VNT Wallet license. \n ' +
        'Open source software is important to us. Some of the software used in our services may be provided under an open source license, and we will provide you with that license. Provisions in the open source license may explicitly override some of these terms. \n '
    },
    {
      title: 'Modify and terminate services',
      cont:
        'We are constantly changing and improving our services. We may add or remove features, or we may suspend or completely stop a service. \n ' +
        'You can stop using our services at any time, although we regret this. VNT Wallet may also stop providing services to you at any time, or add or set new restrictions on our services at any time. \n ' +
        "We think it's important that you own and retain access to your data. If we stop a service, we will issue reasonable advance notice to the user and, where possible, give the user the opportunity to remit information from the service. \n "
    },
    {
      title: 'Warranty and Disclaimer',
      cont:
        'We will provide a commercially reasonable level of skills and care in providing our services and hope you will enjoy using them. However, there are some matters about service that we cannot promise. \n ' +
        'Except as expressly provided in these Terms or Additional Terms, neither VNT Wallet nor its suppliers and distributors make any specific commitments to the Services. For example, we make no promises about the content of the service, the specific features of the service, or its reliability, availability, or ability to meet your needs. Services are provided "as is". \n ' +
        'Some jurisdictions provide specific guarantees, such as implied warranties of merchantability, fitness for a particular purpose, and non-infringement. To the extent permitted by law, we exclude all warranties. \n '
    },
    {
      title: 'Responsibility for service',
      cont:
        'To the extent permitted by law, VNT Wallet and its suppliers and distributors are not liable for loss of profits, loss of revenue or data, financial loss or indirect, special, consequential, punitive or punitive damages. \n ' +
        'To the extent permitted by law, the full liability of VNT Wallet and its suppliers and distributors for any claims (including any implied warranties) under these Terms is limited to the amount you pay us for using the service (or we Select to offer you the service again). \n ' +
        'In all cases, VNT Wallet and its suppliers and distributors are not responsible for any loss or damage that cannot reasonably be foreseen. \n ' +
        'We understand that in some countries you as a consumer have certain legal rights. If you use the service for personal purposes, these terms or additional terms do not limit any consumer legal rights that cannot be waived through the contract. \n '
    },
    {
      title: 'Commercial use of the service',
      cont:
        "If you use our services on behalf of a business, that business must accept these terms. For any claim, prosecution or lawsuit arising out of or in connection with the use of the Service or a breach of these Terms, including any liability or expense arising from claims, losses, damages, prosecutions, judgments, litigation fees and attorneys' fees, The company shall compensate and protect the VNT wallet and its affiliates, managers, agents and employees. "
    },
    {
      title: 'About these terms',
      cont:
        'We may modify the above terms or any additional terms applicable to a service, for example, to reflect changes in law or changes to our services. You should review these terms regularly. We will post notice of changes to these terms on this page. We will post notice of changes to additional terms in the applicable service. The application of all modifications is not retroactive and will take effect 14 days or more after publication. However, special modifications to new service features or modifications made for legal reasons will take effect immediately. If you do not agree to the modified terms of the service, you should stop using the service. \n ' +
        'If there is a conflict between these Terms and the Additional Terms, the Additional Terms shall prevail. \n ' +
        'This clause governs the relationship between VNT Wallet and you and does not create any third party beneficiary rights. \n ' +
        'If you do not comply with these terms and we do not take immediate action, it does not mean that we waive any rights we may have (for example, take action in the future). \n ' +
        'If one clause cannot be enforced, this will not affect the effectiveness of the other clauses. \n ' +
        'For information on how to contact VNT Wallet, check out "About Us" in the service. \n '
    }
  ]
}

export default laws
